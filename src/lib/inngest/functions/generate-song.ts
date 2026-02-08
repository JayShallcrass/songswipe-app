import { inngest } from '@/lib/inngest/client';
import { createServerSupabaseClient } from '@/lib/supabase';
import { generateSong } from '@/lib/elevenlabs';
import { NonRetriableError, RetryAfterError } from 'inngest';

interface GenerateSongEvent {
  data: {
    orderId: string;
    userId: string;
    customizationId: string;
  };
}

export const generateSongFunction = inngest.createFunction(
  {
    id: 'generate-song',
    name: 'Generate Song Variants',
    retries: 4,
    onFailure: async ({ event, error, step }) => {
      const supabase = createServerSupabaseClient();
      const { orderId } = event.data.event.data;

      // Write to dead-letter queue
      await supabase.from('failed_jobs').insert({
        job_type: 'song_generation',
        event_data: event.data.event.data as any,
        error_message: error.message,
        error_stack: error.stack || null,
        retry_count: 4,
      });

      // Update order status to failed
      await supabase.from('orders').update({ status: 'failed' }).eq('id', orderId);

      console.error('Song generation exhausted retries:', { orderId, error: error.message });
    },
  },
  { event: 'song/generation.requested' },
  async ({ event, step }) => {
    const { orderId, userId, customizationId } = event.data;

    // Step 1: Fetch customization
    const customization = await step.run('fetch-customization', async () => {
      const supabase = createServerSupabaseClient();
      const { data, error } = await supabase
        .from('customizations')
        .select('*')
        .eq('id', customizationId)
        .single();

      if (error || !data) {
        throw new Error(`Customization not found: ${customizationId}`);
      }

      return data;
    });

    // Step 2: Update order status to generating
    await step.run('update-order-generating', async () => {
      const supabase = createServerSupabaseClient();
      await supabase.from('orders').update({ status: 'generating' }).eq('id', orderId);
    });

    // Step 3: Create variant records
    const variants = await step.run('create-variant-records', async () => {
      const supabase = createServerSupabaseClient();

      const variantRecords = [1, 2, 3].map((variantNumber) => ({
        order_id: orderId,
        user_id: userId,
        variant_number: variantNumber,
        storage_path: `${orderId}/variant-${variantNumber}.mp3`,
        generation_status: 'pending' as const,
      }));

      const { data, error } = await supabase
        .from('song_variants')
        .insert(variantRecords)
        .select();

      if (error && error.code !== '23505') {
        // Ignore duplicate key errors (idempotency), throw other errors
        throw new Error(`Failed to create variant records: ${error.message}`);
      }

      // If ON CONFLICT returned nothing, fetch the existing records
      if (!data || data.length === 0) {
        const { data: existingData } = await supabase
          .from('song_variants')
          .select('*')
          .eq('order_id', orderId)
          .order('variant_number');

        return existingData || [];
      }

      return data;
    });

    // Step 4: Generate and upload variants
    await step.run('generate-and-upload-variants', async () => {
      const supabase = createServerSupabaseClient();
      let successfulVariants = 0;
      let lastError: Error | null = null;

      for (const variant of variants) {
        try {
          // Update variant status to generating
          await supabase
            .from('song_variants')
            .update({ generation_status: 'generating' })
            .eq('id', variant.id);

          // Map customization fields to Customization type
          const audioBuffer = await generateSong({
            recipientName: customization.recipient_name,
            yourName: customization.your_name,
            occasion: customization.occasion,
            songLength: customization.song_length.toString(),
            mood: customization.mood,
            genre: customization.genre,
            specialMemories: customization.special_memories || undefined,
            thingsToAvoid: customization.things_to_avoid || undefined,
          });

          // Upload to Supabase Storage
          const storagePath = `${userId}/${orderId}/variant-${variant.variant_number}.mp3`;
          const { error: uploadError } = await supabase.storage
            .from('songs')
            .upload(storagePath, audioBuffer, {
              contentType: 'audio/mpeg',
              upsert: true,
            });

          if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`);
          }

          // Update variant record with completion
          await supabase
            .from('song_variants')
            .update({
              storage_path: storagePath,
              generation_status: 'complete',
              completed_at: new Date().toISOString(),
            })
            .eq('id', variant.id);

          successfulVariants++;
        } catch (error: any) {
          lastError = error;

          // Check for specific error types
          if (error.message.includes('400') || error.message.includes('Bad Request')) {
            // Bad input, won't succeed on retry
            await supabase
              .from('song_variants')
              .update({ generation_status: 'failed' })
              .eq('id', variant.id);

            throw new NonRetriableError(`Bad request from Eleven Labs: ${error.message}`);
          }

          if (error.message.includes('429') || error.message.includes('rate limit')) {
            // Rate limit, should retry after delay
            const retryAfter = 60; // Default to 60 seconds if header not available
            throw new RetryAfterError(`Rate limited by Eleven Labs`, retryAfter * 1000);
          }

          // Mark this variant as failed but continue with others
          await supabase
            .from('song_variants')
            .update({ generation_status: 'failed' })
            .eq('id', variant.id);

          console.error('Variant generation failed:', {
            variantId: variant.id,
            variantNumber: variant.variant_number,
            error: error.message,
          });
        }
      }

      // If ALL variants failed, throw to trigger retry of entire step
      if (successfulVariants === 0 && lastError) {
        throw lastError;
      }

      return { successfulVariants, totalVariants: variants.length };
    });

    // Step 5: Finalize order
    await step.run('finalize-order', async () => {
      const supabase = createServerSupabaseClient();

      // Check how many variants completed successfully
      const { data: completedVariants } = await supabase
        .from('song_variants')
        .select('id')
        .eq('order_id', orderId)
        .eq('generation_status', 'complete');

      const completedCount = completedVariants?.length || 0;

      if (completedCount > 0) {
        await supabase.from('orders').update({ status: 'completed' }).eq('id', orderId);
        console.log('Order completed:', { orderId, completedVariants: completedCount });
      } else {
        await supabase.from('orders').update({ status: 'failed' }).eq('id', orderId);
        console.error('Order failed - no variants completed:', { orderId });
      }
    });
  }
);
