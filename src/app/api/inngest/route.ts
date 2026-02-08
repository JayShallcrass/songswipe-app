import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { generateSongFunction } from '@/lib/inngest/functions/generate-song';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateSongFunction],
});
