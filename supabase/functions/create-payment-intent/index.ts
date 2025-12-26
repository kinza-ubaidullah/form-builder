// @ts-ignore: Imports from URL are standard in Deno
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore: Imports from URL are standard in Deno
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, metadata } = await req.json()

    // Enforce $5 minimum (500 cents)
    if (!amount || amount < 500) {
      return new Response(
        JSON.stringify({ error: 'Minimum payment amount is $5.00' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // @ts-ignore: Deno is a global in the Deno environment
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe secret key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2022-11-15',
    })

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
