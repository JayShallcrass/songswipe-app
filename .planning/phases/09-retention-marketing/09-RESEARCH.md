# Phase 9: Retention & Marketing - Research

**Researched:** 2026-02-09
**Domain:** Scheduled email reminders, anniversary-based retention marketing
**Confidence:** HIGH

## Summary

Phase 9 implements anniversary-based retention emails to drive repeat song creation. The system will leverage existing infrastructure (Inngest for scheduling, Resend for emails, Supabase for storage) while adding new components for preference management and date-based job scheduling.

The technical approach centers on two key patterns: (1) **Daily cron job** that queries upcoming anniversaries and schedules individual reminder emails, and (2) **Event-driven email sending** using Inngest functions triggered by scheduled events. The architecture avoids hand-rolling date calculation logic by using date-fns v4 (already installed) with first-class timezone support, and leverages React Email + Resend for template management and delivery.

Critical considerations include CAN-SPAM compliance (one-click unsubscribe, 10-day opt-out processing), avoiding the transactional/marketing email classification pitfall (anniversary reminders are marketing, NOT transactional), and implementing granular opt-out controls (per-occasion and global).

**Primary recommendation:** Use Inngest cron + step.sleepUntil() pattern with a preferences table for opt-out management. Classify emails as marketing (not transactional) and include full CAN-SPAM compliance features from day one.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Inngest | 3.51.0+ | Scheduled job orchestration | Already installed, handles cron scheduling and one-off delayed functions with step.sleepUntil() |
| date-fns | 4.1.0+ | Date calculations and timezone handling | Already installed, v4 has first-class timezone support via @date-fns/tz and @date-fns/utc packages |
| Resend | Latest | Email delivery API | Available as MCP tool, developer-focused with React Email integration |
| React Email | 5.0+ | Email template framework | Official Resend integration, build emails with React + Tailwind |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @date-fns/tz | Latest | Timezone-aware date handling | For calculating anniversaries in user's timezone (optional, date-fns v4 includes this) |
| @react-email/components | Latest | Pre-built email components | Building email templates with React |
| crypto | Node built-in | Generating unsubscribe tokens | Creating secure one-click unsubscribe URLs |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inngest cron | Vercel Cron Jobs | Vercel Cron limited to Hobby: 1/day, Pro: 2/day. Inngest already installed and more flexible |
| Resend | SendGrid, Mailgun | Resend has cleaner API, better React Email integration, and is already available as MCP tool |
| React Email | MJML, HTML templates | React Email is maintained by Resend, seamless integration, better DX |

**Installation:**
```bash
npm install @react-email/components
# date-fns, inngest, and Resend already available
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── inngest/
│   │   ├── functions/
│   │   │   ├── check-anniversaries.ts    # Daily cron
│   │   │   └── send-reminder-email.ts    # Event-triggered email sender
│   │   └── client.ts                     # Existing Inngest client
│   └── emails/
│       └── anniversary-reminder.tsx       # React Email template
├── app/
│   └── api/
│       └── unsubscribe/
│           └── [token]/route.ts          # One-click unsubscribe handler
└── types/
    └── email-preferences.ts               # TypeScript types
```

### Pattern 1: Daily Anniversary Check with Cron
**What:** Inngest function runs daily at midnight, queries occasions in the next 7-14 days, sends event for each reminder to schedule
**When to use:** For checking anniversaries and scheduling individual reminder emails
**Example:**
```typescript
// Source: Inngest scheduled functions docs + WebSearch pattern research
export const checkAnniversaries = inngest.createFunction(
  {
    id: 'check-anniversaries',
    name: 'Check Upcoming Anniversaries',
  },
  { cron: '0 0 * * *' }, // Daily at midnight UTC
  async ({ step }) => {
    const reminders = await step.run('query-upcoming-occasions', async () => {
      const supabase = createServerSupabaseClient();
      const today = new Date();
      const reminderWindow = addDays(today, 7); // 7 days before anniversary

      // Query orders with occasion_date approaching anniversary
      const { data } = await supabase
        .from('orders')
        .select('id, user_id, occasion_date, occasion_type')
        .not('occasion_date', 'is', null)
        .filter('occasion_date', 'lte', format(reminderWindow, 'yyyy-MM-dd'));

      return data || [];
    });

    // Send event for each reminder
    await step.run('schedule-reminder-emails', async () => {
      for (const reminder of reminders) {
        await inngest.send({
          name: 'email/anniversary-reminder.requested',
          data: {
            orderId: reminder.id,
            userId: reminder.user_id,
            occasionDate: reminder.occasion_date,
            occasionType: reminder.occasion_type,
            sendAt: reminder.occasion_date, // Send on actual anniversary
          },
        });
      }
    });
  }
);
```

### Pattern 2: Scheduled Email Delivery with step.sleepUntil()
**What:** Inngest function receives reminder event, sleeps until send date, checks preferences, sends email via Resend
**When to use:** For sending individual reminder emails at precise future timestamps
**Example:**
```typescript
// Source: Inngest step.sleepUntil() docs + Resend integration pattern
export const sendReminderEmail = inngest.createFunction(
  {
    id: 'send-reminder-email',
    name: 'Send Anniversary Reminder Email',
  },
  { event: 'email/anniversary-reminder.requested' },
  async ({ event, step }) => {
    // Sleep until send date
    await step.sleepUntil('wait-for-send-date', event.data.sendAt);

    // Check user preferences
    const prefs = await step.run('check-preferences', async () => {
      const supabase = createServerSupabaseClient();
      const { data } = await supabase
        .from('email_preferences')
        .select('*')
        .eq('user_id', event.data.userId)
        .single();
      return data;
    });

    // Respect opt-out
    if (prefs?.global_unsubscribe || prefs?.occasion_unsubscribes?.includes(event.data.orderId)) {
      return { skipped: true, reason: 'user_opted_out' };
    }

    // Send email
    await step.run('send-email', async () => {
      // Resend API call with React Email template
      await resend.emails.send({
        from: 'SongSwipe <reminders@songswipe.app>',
        to: userEmail,
        subject: `Continue the story for ${event.data.occasionType}`,
        react: AnniversaryReminderEmail({
          occasionType: event.data.occasionType,
          unsubscribeUrl: generateUnsubscribeUrl(event.data.orderId, event.data.userId),
        }),
      });
    });
  }
);
```

### Pattern 3: Email Preferences Schema
**What:** Table storing user email preferences with global and per-occasion opt-out flags
**When to use:** For respecting user unsubscribe choices at different granularity levels
**Example:**
```sql
-- Source: WebSearch preference management patterns + Supabase patterns
CREATE TABLE email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  global_unsubscribe BOOLEAN DEFAULT false,
  occasion_unsubscribes UUID[] DEFAULT '{}', -- Array of order IDs
  unsubscribe_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_email_prefs_user ON email_preferences(user_id);
CREATE INDEX idx_email_prefs_token ON email_preferences(unsubscribe_token);
```

### Pattern 4: One-Click Unsubscribe Handler
**What:** API route that processes unsubscribe token and updates preferences without requiring login
**When to use:** For CAN-SPAM compliant unsubscribe implementation
**Example:**
```typescript
// Source: CAN-SPAM Act compliance requirements + WebSearch patterns
// app/api/unsubscribe/[token]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  const supabase = createServerSupabaseClient();
  const { token } = params;
  const searchParams = new URL(request.url).searchParams;
  const orderId = searchParams.get('order_id'); // Optional: for per-occasion

  // Find preference by token
  const { data: pref } = await supabase
    .from('email_preferences')
    .select('*')
    .eq('unsubscribe_token', token)
    .single();

  if (!pref) {
    return Response.json({ error: 'Invalid token' }, { status: 404 });
  }

  // Update preferences
  if (orderId) {
    // Per-occasion unsubscribe
    await supabase
      .from('email_preferences')
      .update({
        occasion_unsubscribes: [...(pref.occasion_unsubscribes || []), orderId]
      })
      .eq('id', pref.id);
  } else {
    // Global unsubscribe
    await supabase
      .from('email_preferences')
      .update({ global_unsubscribe: true })
      .eq('id', pref.id);
  }

  // Return success page (no login required)
  return new Response(/* HTML success page */);
}
```

### Pattern 5: React Email Template with Unsubscribe Link
**What:** Email template built with React Email components, includes required CAN-SPAM elements
**When to use:** For all marketing emails (anniversary reminders are marketing, not transactional)
**Example:**
```tsx
// Source: React Email + Resend documentation patterns
import { Html, Button, Text, Link } from '@react-email/components';

export function AnniversaryReminderEmail({
  occasionType,
  recipientName,
  unsubscribeUrl,
  createSongUrl
}: Props) {
  return (
    <Html>
      <Text>It's almost time to celebrate {occasionType} again!</Text>
      <Text>Last year you created a special song for {recipientName}.</Text>
      <Button href={createSongUrl}>Continue the Story</Button>

      {/* CAN-SPAM required elements */}
      <Text style={{ fontSize: '12px', color: '#666' }}>
        SongSwipe Inc., [Physical Address Required]
      </Text>
      <Link href={unsubscribeUrl} style={{ fontSize: '12px' }}>
        Unsubscribe from anniversary reminders
      </Link>
      <Link href={`${unsubscribeUrl}?all=true`} style={{ fontSize: '12px' }}>
        Unsubscribe from all emails
      </Link>
    </Html>
  );
}
```

### Anti-Patterns to Avoid

- **Setting up email preferences after first send:** Create preference record when user places first order, not when first email is sent. This prevents race conditions and ensures unsubscribe works even before first email.

- **Using transactional email classification:** Anniversary reminders are marketing emails, NOT transactional. They must include unsubscribe links and follow CAN-SPAM rules. Don't skip these thinking "it's just a reminder."

- **Requiring login to unsubscribe:** CAN-SPAM requires one-click unsubscribe without login. Don't redirect to "manage preferences" page that requires authentication.

- **Calculating anniversaries without timezone awareness:** User's occasion_date is likely in their local timezone. Use date-fns TZDate to avoid off-by-one-day errors.

- **Sending to all users in a batch:** Send individual scheduled events for each reminder. This allows granular cancellation if user unsubscribes before send date.

- **Storing plain user IDs in unsubscribe URLs:** Use unique tokens that map to users/occasions. This prevents URL manipulation attacks.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scheduling future emails | Custom queue + database polling | Inngest step.sleepUntil() + cron | Inngest handles scheduling, retries, idempotency. Custom queue needs infrastructure, monitoring, scaling |
| Email templates | String concatenation HTML | React Email + Resend | React Email handles responsive design, email client quirks, testing. Hand-rolled HTML breaks in Outlook/Gmail |
| Unsubscribe token generation | Hashing user ID | crypto.randomBytes() + database lookup | Hashing is predictable, tokens should be unguessable. Collision risk with naive hashing |
| Date/time calculations | Date arithmetic with + and - | date-fns addDays, differenceInDays, etc. | Edge cases: DST transitions, leap years, month boundaries. date-fns handles all of this |
| Timezone conversion | Manual UTC offset math | date-fns TZDate, formatInTimeZone | DST rules change by region, historical date handling is complex. TZDate uses IANA database |
| Email deliverability | Direct SMTP | Resend or SendGrid | Deliverability requires: SPF, DKIM, DMARC, IP reputation, bounce handling. Services solve this |

**Key insight:** Retention email systems look simple ("just send an email on a date") but have hidden complexity: timezone edge cases, deliverability infrastructure, compliance requirements, preference management, and idempotency. Using purpose-built tools avoids months of debugging production issues.

## Common Pitfalls

### Pitfall 1: Anniversary Date Timezone Misalignment
**What goes wrong:** User in California sets occasion_date as "2024-02-14" (Valentine's Day) but email sends on Feb 13th or 15th due to UTC conversion issues.
**Why it happens:** occasion_date is stored as DATE type (no timezone info) but server calculates "anniversary" in UTC, causing off-by-one-day errors for users in negative UTC offset timezones.
**How to avoid:** Store occasion_date as DATE (correct, timezone-agnostic) but when scheduling reminders, assume user's timezone or application default timezone. Use date-fns to calculate "7 days before anniversary in user's timezone" rather than "7 days before UTC midnight."
**Warning signs:** User reports "got reminder on wrong day," complaints cluster in specific timezones (PST, EST), Inngest logs show sleep-until timestamps that don't match expected dates.

### Pitfall 2: Transactional Email Misclassification
**What goes wrong:** Anniversary reminder sent as "transactional" email without unsubscribe link, violating CAN-SPAM, leading to spam complaints and deliverability issues.
**Why it happens:** Developer thinks "reminder about user's own order = transactional" but CAN-SPAM classifies by primary purpose. If email's purpose is to drive new purchase (not confirm existing transaction), it's marketing.
**How to avoid:** Treat anniversary reminders as marketing emails from day one. Include: unsubscribe link, physical address, accurate From/Subject, honor opt-outs within 10 days. Use Resend's List-Unsubscribe header for one-click unsubscribe.
**Warning signs:** High spam complaint rate, Resend account warnings about missing unsubscribe links, Gmail/Yahoo rejecting emails.

### Pitfall 3: Duplicate Reminder Scheduling
**What goes wrong:** Cron job runs twice (deployment, retry, etc.) and schedules duplicate reminder emails for same occasion.
**Why it happens:** Cron jobs are not inherently idempotent. If daily job crashes halfway through, restart will re-process same occasions.
**How to avoid:** Use Inngest event IDs for deduplication. Include occasion_date + order_id in event ID: `email/anniversary-reminder.requested/${orderId}/${occasionDate}`. Inngest automatically deduplicates events with same ID within 24 hours.
**Warning signs:** Users report "got multiple reminder emails," Inngest dashboard shows duplicate runs for same date, email metrics show 2x volume on certain days.

### Pitfall 4: Unsubscribe Not Honored Before Send
**What goes wrong:** User unsubscribes today but still receives email scheduled for tomorrow because preference check happens when event is created, not when email sends.
**Why it happens:** Checking preferences at scheduling time (in cron job) rather than at send time (in email function). Once step.sleepUntil() completes, email sends regardless of updated preferences.
**How to avoid:** Always check preferences inside the send-email function, after step.sleepUntil() completes but before sending. This ensures real-time preference respect.
**Warning signs:** User complains "I unsubscribed but still got email," preference table shows unsubscribe timestamp before email sent_at timestamp.

### Pitfall 5: No List-Unsubscribe Header
**What goes wrong:** Email requires user to click link and visit webpage to unsubscribe, violating Gmail/Yahoo's one-click requirement (as of 2024).
**Why it happens:** Developer only implements web-based unsubscribe, doesn't add List-Unsubscribe header for native email client unsubscribe.
**How to avoid:** Add List-Unsubscribe and List-Unsubscribe-Post headers to all marketing emails. Resend supports this via headers parameter. Implement both HTTP endpoint (GET for web, POST for RFC 8058 one-click).
**Warning signs:** Gmail users report "Unsubscribe button doesn't work," Resend deliverability score drops, Yahoo/Gmail moves emails to spam.

### Pitfall 6: Stale Anniversary Calculations
**What goes wrong:** User who created song in 2023 gets reminder in 2026 even though they stopped using the service in 2024.
**Why it happens:** System calculates anniversaries purely based on occasion_date without considering user engagement, account status, or subscription state.
**How to avoid:** Add engagement checks in anniversary query: only send reminders for users who logged in within last 12 months, or who completed orders within 18 months, or who explicitly opted into reminders. Consider adding "active" flag to email_preferences.
**Warning signs:** High unsubscribe rate from old users, low click-through rate on anniversary emails, spam complaints from dormant accounts.

### Pitfall 7: Missing Physical Address in Footer
**What goes wrong:** Marketing email sent without required physical postal address, violating CAN-SPAM.
**Why it happens:** Developer focuses on unsubscribe link but forgets other CAN-SPAM requirements (physical address, accurate From/Subject).
**How to avoid:** Create email template checklist: (1) Accurate From name/email, (2) Non-deceptive subject, (3) Physical postal address, (4) Unsubscribe link, (5) List-Unsubscribe header. Store company address in environment variable, include in every template footer.
**Warning signs:** FTC warning letter, Resend compliance alerts, legal review flags missing address.

## Code Examples

Verified patterns from official sources:

### Inngest Cron Schedule Syntax
```typescript
// Source: Inngest scheduled functions documentation
// https://www.inngest.com/docs/guides/scheduled-functions

// Run daily at midnight UTC
{ cron: '0 0 * * *' }

// Run every Monday at 9am UTC
{ cron: '0 9 * * 1' }

// Run on 1st of every month at noon UTC
{ cron: '0 12 1 * *' }

// TIP: Use timezone parameter for non-UTC schedules
{ cron: 'TZ=America/Los_Angeles 0 9 * * *' }
```

### Inngest step.sleepUntil() with Future Timestamp
```typescript
// Source: Inngest step.sleepUntil() reference
// https://www.inngest.com/docs/reference/functions/step-sleep-until

// Sleep until specific ISO string
await step.sleepUntil('wait-for-date', '2024-03-15T12:00:00Z');

// Sleep until Date object
const sendDate = new Date('2024-03-15');
await step.sleepUntil('wait-for-date', sendDate);

// Sleep until timestamp from event data
await step.sleepUntil('wait-for-date', event.data.scheduledTime);

// IMPORTANT: sleepUntil only works with static dates across retries
// Don't use: new Date(Date.now() + 7*24*60*60*1000) // Changes each retry!
// Do use: event.data.sendAt // Same value across retries
```

### date-fns v4 Timezone-Aware Anniversary Calculation
```typescript
// Source: date-fns v4 timezone support documentation
// https://blog.date-fns.org/v40-with-time-zone-support/
import { TZDate, addYears, differenceInDays, formatInTimeZone } from 'date-fns';

// Calculate next anniversary in user's timezone
const occasionDate = new Date('2024-02-14'); // Stored in DB
const userTimezone = 'America/Los_Angeles';

// Current date in user's timezone
const nowInUserTZ = new TZDate(new Date(), userTimezone);

// Calculate next anniversary
let nextAnniversary = new TZDate(occasionDate, userTimezone);
while (nextAnniversary < nowInUserTZ) {
  nextAnniversary = addYears(nextAnniversary, 1);
}

// Calculate reminder date (7 days before)
const reminderDate = addDays(nextAnniversary, -7);

// Format for display or scheduling
const isoString = nextAnniversary.toISOString(); // For Inngest sleepUntil
```

### Resend Email with React Email Template
```typescript
// Source: React Email Resend integration documentation
// https://react.email/docs/integrations/resend
import { Resend } from 'resend';
import { AnniversaryReminderEmail } from '@/lib/emails/anniversary-reminder';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'SongSwipe <hello@songswipe.app>',
  to: user.email,
  subject: 'Continue Your Story - Anniversary Reminder',
  react: AnniversaryReminderEmail({
    recipientName: order.recipient_name,
    occasionType: order.occasion_type,
    createSongUrl: `https://songswipe.app/create?occasion=${order.occasion_type}`,
    unsubscribeUrl: `https://songswipe.app/api/unsubscribe/${token}?order_id=${order.id}`,
  }),
  headers: {
    'List-Unsubscribe': `<https://songswipe.app/api/unsubscribe/${token}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  },
});
```

### CAN-SPAM Compliant React Email Template
```tsx
// Source: CAN-SPAM Act requirements + React Email component library
// https://react.email/docs/components/introduction
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Link,
  Hr,
} from '@react-email/components';

export function AnniversaryReminderEmail({
  recipientName,
  occasionType,
  createSongUrl,
  unsubscribeUrl,
}: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <Section>
            <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
              🎵 Time to Continue the Story
            </Text>
            <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
              It's almost time to celebrate {occasionType} again! Last year, you created
              a special song for {recipientName}.
            </Text>
            <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
              Create a new version to continue your musical tradition:
            </Text>
            <Button
              href={createSongUrl}
              style={{
                backgroundColor: '#FF4876',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              Create This Year's Song
            </Button>
          </Section>

          <Hr style={{ margin: '40px 0', borderColor: '#ddd' }} />

          {/* CAN-SPAM Required Footer */}
          <Section style={{ fontSize: '12px', color: '#666' }}>
            <Text>
              SongSwipe Inc.<br />
              [Physical Postal Address Required by CAN-SPAM]<br />
              [City, State ZIP]
            </Text>
            <Text>
              <Link href={unsubscribeUrl} style={{ color: '#666', textDecoration: 'underline' }}>
                Unsubscribe from {occasionType} reminders
              </Link>
              {' | '}
              <Link href={`${unsubscribeUrl}?all=true`} style={{ color: '#666', textDecoration: 'underline' }}>
                Unsubscribe from all emails
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Vercel Cron for scheduling | Inngest cron + event-driven architecture | 2023 | Vercel Cron limited to 1-2 jobs per day on hobby/pro, Inngest supports unlimited scheduled functions |
| date-fns-tz separate package | date-fns v4 built-in timezone support | 2024 | Simplified timezone handling, smaller bundle size (TZDateMini 761B vs full date-fns-tz) |
| Manual List-Unsubscribe headers | RFC 8058 one-click unsubscribe | 2024 | Gmail/Yahoo require one-click for bulk senders (5k+ msgs/day), enforced penalties for non-compliance |
| MJML for email templates | React Email | 2023 | React Email maintained by Resend, seamless integration, better developer experience |
| Transactional email for reminders | Marketing email classification | Ongoing | CAN-SPAM enforcement increased, reminder emails clarified as marketing (promotional intent) |

**Deprecated/outdated:**
- **Vercel Cron for daily jobs**: Limited frequency on non-enterprise plans, Inngest offers more flexibility with no frequency limits
- **date-fns v2 with separate date-fns-tz**: v4 includes timezone support natively, no need for additional package
- **Two-click unsubscribe (link to preference page)**: Gmail/Yahoo now penalize bulk senders without one-click unsubscribe via List-Unsubscribe-Post header
- **Classifying anniversary reminders as transactional**: These are marketing emails (intent to drive purchase), must include unsubscribe and follow CAN-SPAM rules

## Open Questions

1. **What is the company's physical postal address for CAN-SPAM compliance?**
   - What we know: CAN-SPAM requires physical postal address in footer of all marketing emails
   - What's unclear: SongSwipe's registered business address
   - Recommendation: Add COMPANY_ADDRESS environment variable, use in all email templates. If no physical office, use registered agent address or PO box (allowed by CAN-SPAM).

2. **Should reminders be sent at a specific time of day in user's timezone?**
   - What we know: Current approach schedules emails for midnight UTC on anniversary date
   - What's unclear: Whether 9am local time would have better open rates than midnight UTC (which could be middle of night for some users)
   - Recommendation: Start with "7 days before occasion_date at 9am UTC" (simple, consistent). Add timezone-aware scheduling in future iteration if needed. Track open rates by send time to optimize later.

3. **How many days before anniversary should reminder be sent?**
   - What we know: Requirements say "before the anniversary" but don't specify timing
   - What's unclear: 7 days vs 14 days vs 30 days before. Too early = forget by anniversary. Too late = no time to create song.
   - Recommendation: Default to 7 days before (one week notice). Make configurable via environment variable REMINDER_DAYS_BEFORE=7 for easy A/B testing without code changes.

4. **Should there be a cap on how many years of anniversaries to track?**
   - What we know: System will send reminders for every anniversary indefinitely
   - What's unclear: Whether to stop after X years of inactivity (e.g., user hasn't logged in for 3 years)
   - Recommendation: Add engagement filter to anniversary query: only send reminders if user logged in within last 18 months OR explicitly opted into long-term reminders. Reduces spam complaints and improves deliverability.

## Sources

### Primary (HIGH confidence)
- [Inngest scheduled functions documentation](https://www.inngest.com/docs/guides/scheduled-functions) - Cron syntax and scheduled function patterns
- [Inngest step.sleepUntil() reference](https://www.inngest.com/docs/reference/functions/step-sleep-until) - Sleeping until specific timestamps
- [date-fns v4 timezone support](https://blog.date-fns.org/v40-with-time-zone-support/) - First-class timezone handling in date-fns v4
- [React Email Resend integration](https://react.email/docs/integrations/resend) - Official integration guide
- [CAN-SPAM Act compliance guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business) - Federal Trade Commission official requirements
- [Resend official site](https://resend.com) - Email platform features and capabilities

### Secondary (MEDIUM confidence)
- [Retention email best practices 2026](https://www.retainful.com/blog/retention-marketing) - WebSearch verified with multiple sources
- [Email marketing trends 2026](https://www.mailjet.com/blog/email-best-practices/email-marketing-trends-2026/) - Current email marketing practices
- [One-click unsubscribe requirements](https://www.valimail.com/blog/one-click-unsubscribe/) - RFC 8058 and Gmail/Yahoo requirements
- [Email opt-out patterns 2026](https://moosend.com/blog/email-opt-out/) - Preference management patterns
- [Transactional vs marketing email](https://www.socketlabs.com/blog/transactional-email-can-spam/) - CAN-SPAM classification guidance

### Tertiary (LOW confidence)
- [Anniversary database schema patterns](https://www.tutorials24x7.com/mysql/guide-to-design-database-for-calendar-event-and-reminder-in-mysql) - Generic reminder system architecture (not SaaS-specific)
- [Notification engine architecture](https://medium.com/@prateek.259/notification-engine-as-a-microservice-764bf952f12d) - Conceptual architecture patterns (not Inngest-specific)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Inngest, date-fns, and Resend are well-documented with official docs, already installed in project
- Architecture: HIGH - Patterns verified from official Inngest documentation and Resend integration guides
- Pitfalls: MEDIUM-HIGH - Common pitfalls identified through CAN-SPAM official requirements and email marketing best practices articles
- Email deliverability: MEDIUM - List-Unsubscribe requirements verified from multiple sources but Gmail/Yahoo enforcement specifics are from secondary sources
- Timezone handling: HIGH - date-fns v4 official blog post and documentation confirm built-in timezone support

**Research date:** 2026-02-09
**Valid until:** 2026-04-09 (60 days - email compliance and scheduling patterns are stable, but email provider requirements can change quarterly)
