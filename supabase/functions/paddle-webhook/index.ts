import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const payload = await req.json()
        const { event_type, data } = payload

        // Only process successful checkout completions
        if (event_type !== 'checkout.completed') {
            return new Response(JSON.stringify({ status: 'ignored' }), { status: 200, headers: corsHeaders })
        }

        // @ts-ignore
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        // @ts-ignore
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

        const userId = data.custom_data?.user_id
        if (!userId) {
            throw new Error('User ID missing in custom data')
        }

        // Get current profile to check for early renewal
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('subscription_end_date, bonus_forms')
            .eq('id', userId)
            .single()

        if (profileError) throw profileError

        const isEarlyRenewal = profile.subscription_end_date && new Date(profile.subscription_end_date) > new Date()
        const bonus = isEarlyRenewal ? 5 : 0

        // Update profile
        const startDate = new Date().toISOString()
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                is_premium: true,
                subscription_status: 'active',
                subscription_start_date: startDate,
                subscription_end_date: endDate,
                bonus_forms: (profile.bonus_forms || 0) + bonus,
                payment_method: 'paddle',
                payment_details: { paddle_checkout_id: data.id }
            })
            .eq('id', userId)

        if (updateError) throw updateError

        return new Response(JSON.stringify({ status: 'success', bonus_awarded: bonus }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error: any) {
        console.error('Webhook error:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
