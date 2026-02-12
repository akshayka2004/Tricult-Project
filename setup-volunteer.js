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

async function setupVolunteer() {
    const password = 'volunteer123';
    const hash = bcrypt.hashSync(password, 10);

    console.log('Generated hash for volunteer123');
    console.log('Verifying hash...', bcrypt.compareSync(password, hash) ? 'OK' : 'FAILED');

    // Check if volunteer exists
    const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('ticket_number', 'VOL-001')
        .single();

    if (existing) {
        // Update existing volunteer
        const { error } = await supabase
            .from('profiles')
            .update({ password: hash, is_volunteer: true })
            .eq('ticket_number', 'VOL-001');

        if (error) {
            console.error('Failed to update volunteer:', error.message);
        } else {
            console.log('Volunteer password UPDATED successfully!');
        }
    } else {
        // Insert new volunteer
        const { error } = await supabase
            .from('profiles')
            .insert({
                ticket_number: 'VOL-001',
                username: 'Hub Volunteer',
                password: hash,
                is_admin: false,
                is_volunteer: true,
                balance_tokens: 0,
                card_color: '#00ff88',
            });

        if (error) {
            console.error('Failed to create volunteer:', error.message);
        } else {
            console.log('Volunteer user CREATED successfully!');
        }
    }

    // Verify by fetching and comparing
    const { data: volunteer } = await supabase
        .from('profiles')
        .select('username, ticket_number, password')
        .eq('ticket_number', 'VOL-001')
        .single();

    if (volunteer) {
        const verified = bcrypt.compareSync(password, volunteer.password);
        console.log(`\nVerification: ${volunteer.username} (${volunteer.ticket_number})`);
        console.log(`Password 'volunteer123' matches stored hash: ${verified ? 'YES ✓' : 'NO ✗'}`);
    }
}

setupVolunteer().catch(console.error);
