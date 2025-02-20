import { Stripe } from 'https://esm.sh/stripe@12.18.0?deno-std=0.168.0';

export const stripe = new Stripe(
  Deno.env.get('STRIPE_SECRET_KEY') || 'sk_test_51QsCFKH58PSZdj8LKIBq5k2P9xo41KefYdNQhWrEBTXdm0ruKuYGtHvXTeYp7BbAjfyY28U2jNPrgsuJS0BR3NPJ00k2pw99sn',
  {
    apiVersion: '2023-10-16',
    httpClient: fetch,
  }
); 