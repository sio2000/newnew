import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.20.0?deno-std=0.168.0';
import { corsHeaders } from '../_shared/cors.ts';

// Initialize Supabase
const supabase = createClient(
  'https://utuoppaqarwowecxxjqw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dW9wcGFxYXJ3b3dlY3h4anF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODYzOTE3OSwiZXhwIjoyMDU0MjE1MTc5fQ.826lqbJRHtPxEcSrEYGn4ZkhzaqLy4-8NdRe_G2z4wY'
);

serve(async (req: Request) => {
  try {
    console.log('🔵 Webhook called');

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const rawBody = await req.text();
    console.log('📦 Raw body:', rawBody);

    let event;
    try {
      event = JSON.parse(rawBody);
      console.log('✅ Parsed event:', event);
    } catch (err) {
      console.error('❌ JSON parsing failed:', err);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Απλή ενημέρωση του χρήστη
    const userId = 'test-user-123'; // Hardcoded για testing
    console.log('🔄 Updating user:', userId);

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: 'test@example.com',
        subscription_status: 'premium',
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Database error', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Success!');
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}); 