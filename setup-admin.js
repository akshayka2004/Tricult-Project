import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read .env manually
const envPath = resolve('.env');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...val] = line.trim().split('=');
    if (key && val.length) env[key] = val.join('=');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function setupAdmin() {
    const password = 'admin123';
    const hash = bcrypt.hashSync(password, 10);

    console.log('Generated hash for admin123');
    console.log('Verifying hash...', bcrypt.compareSync(password, hash) ? 'OK' : 'FAILED');

    // Check if admin exists
    const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('ticket_number', 'ADMIN-001')
        .single();

    if (existing) {
        // Update existing admin
        const { error } = await supabase
            .from('profiles')
            .update({ password: hash })
            .eq('ticket_number', 'ADMIN-001');

        if (error) {
            console.error('Failed to update admin:', error.message);
        } else {
            console.log('Admin password UPDATED successfully!');
        }
    } else {
        // Insert new admin
        const { error } = await supabase
            .from('profiles')
            .insert({
                ticket_number: 'ADMIN-001',
                username: 'Event Admin',
                password: hash,
                is_admin: true,
                balance_tokens: 0,
                card_color: '#ff00ff',
            });

        if (error) {
            console.error('Failed to create admin:', error.message);
        } else {
            console.log('Admin user CREATED successfully!');
        }
    }

    // Verify by fetching and comparing
    const { data: admin } = await supabase
        .from('profiles')
        .select('username, ticket_number, password')
        .eq('ticket_number', 'ADMIN-001')
        .single();

    if (admin) {
        const verified = bcrypt.compareSync(password, admin.password);
        console.log(`\nVerification: ${admin.username} (${admin.ticket_number})`);
        console.log(`Password 'admin123' matches stored hash: ${verified ? 'YES ✓' : 'NO ✗'}`);
    }
}

setupAdmin().catch(console.error);
