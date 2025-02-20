import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { stripe } from '../_shared/stripe.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Log the request headers
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    // Parse and log the request body
    const body = await req.text();
    console.log('Raw request body:', body);
    
    let data;
    try {
      data = JSON.parse(body);
    } catch (e) {
      console.error('Error parsing JSON:', e);
      throw new Error('Invalid JSON body');
    }

    const { userId, email } = data;
    console.log('Parsed data:', { userId, email });

    if (!userId || !email) {
      throw new Error('Missing required fields: userId and email are required');
    }

    console.log('Creating Stripe session with data:', {
      customer_email: email,
      client_reference_id: userId,
      mode: 'subscription'
    });

    // Δημιουργία του Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      client_reference_id: userId,
      payment_method_types: ['card'],
      mode: 'subscription',
      metadata: {
        supabaseUserId: userId,
      },
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Premium Subscription',
              description: 'Monthly premium subscription for parking app'
            },
            unit_amount: 999, // 9.99 EUR
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:5173/dashboard/success',
      cancel_url: 'http://localhost:5173/dashboard/cancel',
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    console.log('Stripe session created:', {
      id: session.id,
      url: session.url,
      customer_email: session.customer_email,
      payment_status: session.payment_status,
    });

    if (!session.url) {
      console.error('No URL in session:', session);
      throw new Error('No checkout URL in session');
    }

    const response = {
      url: session.url,
      sessionId: session.id
    };
    
    console.log('Sending response:', response);

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Detailed error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      details: error
    });

    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    );
  }
}); 