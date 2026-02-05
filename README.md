# SongSwipe - AI Music Generator App

AI-powered personalized song gift platform. Create unique songs for Valentine's, birthdays, anniversaries, and more.

## 🎵 Features

- **AI Music Generation** - Powered by Eleven Labs Music API
- **Personalized Lyrics** - Custom songs based on your inputs
- **Swipe Interface** - Preview and select your favorite version
- **Secure Payments** - Stripe integration
- **User Dashboard** - View and download your songs
- **Enterprise Security** - RLS policies, signed URLs, audit logging

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Stripe account
- Eleven Labs account (Music API access)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd songswipe-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Environment Variables

Create `.env.local` with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Eleven Labs
ELEVEN_LABS_API_KEY=sk_xxx

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MARKETING_URL=http://localhost:3001
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── customize/     # Create song customization
│   │   ├── orders/        # Get order details
│   │   └── webhook/      # Stripe webhooks
│   ├── dashboard/        # User dashboard
│   ├── order/[id]/        # Order completion page
│   └── page.tsx          # Customization form
├── components/
│   └── SwipeInterface.tsx # Swipe card interface
├── lib/
│   ├── supabase.ts        # Supabase client
│   ├── stripe.ts          # Stripe integration
│   └── elevenlabs.ts      # Eleven Labs API
└── types/
    └── database.ts        # TypeScript types
```

## 🎨 Customization Flow

1. **Recipient Info** - Name and occasion
2. **Style Selection** - Mood and genre
3. **Personal Touches** - Memories and preferences
4. **Payment** - Stripe checkout
5. **Generation** - AI creates your song
6. **Download** - Get your MP3

## 🔒 Security

- **Row Level Security (RLS)** - Users can only access their own data
- **Signed URLs** - Audio files with 15-minute expiry
- **Download Logging** - All downloads are tracked
- **Rate Limiting** - API rate limits enforced
- **Webhook Verification** - Stripe signature validation

## 📊 Database Schema

Run `supabase-schema.sql` in Supabase SQL Editor to set up:

- `users` - User profiles
- `customizations` - Song customization data
- `orders` - Payment orders
- `songs` - Generated song references
- `downloads` - Download audit log

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run test:e2e
```

## 📦 Deployment

### Vercel

```bash
npm run build
vercel --prod
```

### Environment

Set all environment variables in Vercel project settings.

## 💰 Pricing

- **Personalized Song**: £7.99
- Includes: 60-120s song, MP3 download, instant delivery

## 🔗 Links

- **Marketing Site**: https://songswipe.io
- **App**: https://app.songswipe.io
- **Support**: support@songswipe.io

## 📄 License

MIT License - See LICENSE file for details.
