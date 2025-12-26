import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHash } from "https://deno.land/std@0.168.0/node/crypto.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { amount, orderId, customerEmail, customerMobile, customerName, metadata } = await req.json()

        // @ts-ignore
        const merchantId = Deno.env.get('PAYFAST_MERCHANT_ID')
        // @ts-ignore
        const securedKey = Deno.env.get('PAYFAST_SECURED_KEY')
        const successUrl = `${req.headers.get('origin')}/payment-success`
        const failureUrl = `${req.headers.get('origin')}/payment-failure`

        if (!merchantId || !securedKey) {
            throw new Error('PayFast credentials not configured')
        }

        // PayFast signature generation (Example flow for payfast.pk)
        // Format: merchant_id=...&secured_key=...&...
        const rawSignature = `merchant_id=${merchantId}&secured_key=${securedKey}&basket_id=${orderId}&trans_amount=${amount}`
        const md5Hash = createHash('md5').update(rawSignature).digest('hex')

        const payfastUrl = 'https://ipg1.payfast.pk/api/checkout'

        // Return the necessary data for the frontend to submit a POST form
        return new Response(
            JSON.stringify({
                url: payfastUrl,
                params: {
                    merchant_id: merchantId,
                    secured_key: securedKey,
                    basket_id: orderId,
                    trans_amount: amount,
                    currency_code: 'PKR',
                    customer_email: customerEmail,
                    customer_mobile: customerMobile,
                    customer_name: customerName,
                    success_url: successUrl,
                    failure_url: failureUrl,
                    checkout_all: 'true'
                }
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
