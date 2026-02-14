import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Read .env manually
const envPath = resolve('.env');
if (!existsSync(envPath)) {
    console.error('Error: .env file not found!');
    process.exit(1);
}

const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    // Remove comments and trim
    const cleanLine = line.split('#')[0].trim();
    if (!cleanLine) return;

    // Split key=value
    const [key, ...valParts] = cleanLine.split('=');
    if (key && valParts.length > 0) {
        let val = valParts.join('=');
        // Remove quotes if present
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        env[key.trim()] = val.trim();
    }
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY (or SERVICE_ROLE_KEY) in .env');
    process.exit(1);
}

const supabase = createClient(url, key);

async function resetAndSetup() {
    console.log('⚠ WARNING: This script will WIPE all data (profiles, transactions, sessions).');
    console.log('Starting in 3 seconds...');
    await new Promise(r => setTimeout(r, 3000));

    console.log('\n🗑 Wiping existing data...');

    // Delete in order to respect FK constraints
    const { error: err1 } = await supabase.from('sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err1) console.error('Error wiping sessions:', err1.message);
    else console.log('✓ Sessions cleared');

    const { error: err2 } = await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err2) console.error('Error wiping transactions:', err2.message);
    else console.log('✓ Transactions cleared');

    const { error: err3 } = await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err3) console.error('Error wiping profiles:', err3.message);
    else console.log('✓ Profiles cleared');

    console.log('\nCreating new admin accounts...');

    const admins = [
        { username: 'EventAdmin1', pass: 'admin@1', ticket: 'ADMIN-001' },
        { username: 'EventAdmin2', pass: 'admin@2', ticket: 'ADMIN-002' }
    ];

    for (const admin of admins) {
        const hash = bcrypt.hashSync(admin.pass, 10);
        const { error } = await supabase
            .from('profiles')
            .upsert({
                ticket_number: admin.ticket,
                username: admin.username,
                password: hash,
                is_admin: true,
                is_volunteer: false,
                balance_tokens: 0,
                card_color: '#ff00ff', // Admin color
            }, { onConflict: 'ticket_number' });

        if (error) {
            console.error(`✗ Failed to create ${admin.username}:`, error.message);
        } else {
            console.log(`✓ Created/Updated ${admin.username} (Password: ${admin.pass})`);
        }
    }

    console.log('\nCreating default volunteer account...');
    const volHash = bcrypt.hashSync('volunteer123', 10);
    const { error: volError } = await supabase
        .from('profiles')
        .upsert({
            ticket_number: 'VOL-001',
            username: 'Hub Volunteer',
            password: volHash,
            is_admin: false,
            is_volunteer: true,
            balance_tokens: 0,
            card_color: '#00ff88',
        }, { onConflict: 'ticket_number' });

    if (volError) {
        console.error('✗ Failed to create default volunteer:', volError.message);
    } else {
        console.log('✓ Created/Updated Hub Volunteer (Password: volunteer123)');
    }

    console.log('\nDONE. System reset complete.');
}

resetAndSetup().catch(console.error);
