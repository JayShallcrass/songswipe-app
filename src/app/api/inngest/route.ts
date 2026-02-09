import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { generateSongFunction } from '@/lib/inngest/functions/generate-song';
import { checkAnniversaries } from '@/lib/inngest/functions/check-anniversaries';
import { sendReminderEmail } from '@/lib/inngest/functions/send-reminder-email';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateSongFunction, checkAnniversaries, sendReminderEmail],
});
