
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Robust payload parsing
        let payload;
        try {
            payload = await req.json();
        } catch (e) {
            console.error('Error parsing JSON payload:', e);
            return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        console.log("Payload received:", JSON.stringify(payload, null, 2));

        // 1. Parse the Database Webhook Payload
        // Format: { type: 'INSERT', table: 'submissions', record: { ... }, ... }
        const { record, type, table } = payload;

        if (!record || !record.form_id) {
            console.warn('Webhook received but no record or form_id found. Check if this is an INSERT on the submissions table.');
            return new Response(JSON.stringify({
                message: 'No record or form_id found',
                details: 'This function expects a Supabase Database Webhook payload (INSERT on submissions table)'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        const formId = record.form_id;
        console.log(`Processing ${type} on ${table} for form: ${formId}`);

        // 2. Fetch Integrations Settings
        // Runs in parallel for performance
        const [webhooksResult, emailConfigResult] = await Promise.all([
            supabaseClient.from('webhooks').select('*').eq('form_id', formId).eq('enabled', true),
            supabaseClient.from('email_configs').select('*').eq('form_id', formId).eq('enabled', true).maybeSingle()
        ]);

        if (webhooksResult.error) {
            console.error('Error fetching webhooks:', webhooksResult.error);
        }
        if (emailConfigResult.error) {
            console.error('Error fetching email config:', emailConfigResult.error);
        }

        const webhooks = webhooksResult.data || [];
        const emailConfig = emailConfigResult.data;

        // 3. Process Webhooks
        const webhookPromises = webhooks.map(async (hook) => {
            try {
                console.log(`Sending webhook to: ${hook.url}`);
                const response = await fetch(hook.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event: 'form_submission',
                        form_id: formId,
                        submission: record.data,
                        submitted_at: record.submitted_at
                    }),
                });
                return { id: hook.id, status: response.status, success: response.ok };
            } catch (error) {
                console.error(`Webhook failed for ${hook.url}:`, error);
                return { id: hook.id, success: false, error: String(error) };
            }
        });

        // 4. Process Email (Mock implementation or Resend integration)
        let emailResult = null;
        if (emailConfig) {
            console.log(`Email notification enabled for: ${emailConfig.recipients.join(', ')}`);
            // Add your email provider logic here (e.g. Resend, SendGrid)
            emailResult = { success: true, message: "Email logic triggered (Simulation)" };
        }

        // Wait for all webhooks to complete
        const webhookResults = await Promise.all(webhookPromises);

        return new Response(JSON.stringify({
            success: true,
            webhooks_processed: webhookResults.length,
            webhook_details: webhookResults,
            email_processed: !!emailConfig,
            email_result: emailResult
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('Unhandled error in handle-submission function:', error);
        return new Response(JSON.stringify({ error: String(error) }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
