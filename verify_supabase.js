
// Scripts usually don't have access to .env automatically without dotenv, but I can read it manually or just pass vars.
// I'll assume I can read the .env file or just paste the values I saw earlier (risky if they changed? No, I saw them).
// I'll read the file to be safe.

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manual .env parsing
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

const supabaseUrl = envVars['VITE_SUPABASE_URL'];
const supabaseKey = envVars['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

console.log('Connecting to:', supabaseUrl);
// console.log('Using Key:', supabaseKey); // Don't log key

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        const timestamp = Date.now();
        const username = 'test_user_' + timestamp;
        const email = `${username}@miaoda.com`;
        // Stronger password to satisfy Supabase defaults
        const password = 'StrongPassword!123';

        const contactEmail = `contact_${timestamp}@gmail.com`; // Use a "valid" domain for test
        const phone = '+15550109999';

        console.log(`Attempting sign up with username: ${username}...`);
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username,
                    contact_email: contactEmail,
                    phone_number: phone,
                }
            }
        });

        if (error) {
            console.log('Error encountered:', error.message);
            console.log('Error status:', error.status);
        } else {
            console.log('Sign up successful!');
            console.log('User created:', data.user?.id);
            console.log('Metadata:', data.user?.user_metadata);
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
