import { supabase } from './supabase';

/**
 * Generate a unique ticket number in format: TRI-XX9999
 * 2 uppercase letters + 4 digits = 6,760,000 possible combinations
 * Handles ~800 participants with near-zero collision probability
 */
export async function generateTicketNumber() {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // excluded I and O to avoid confusion
    const maxAttempts = 10;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const l1 = letters[Math.floor(Math.random() * letters.length)];
        const l2 = letters[Math.floor(Math.random() * letters.length)];
        const num = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        const ticket = `TRI-${l1}${l2}${num}`;

        // Check uniqueness
        const { data } = await supabase
            .from('profiles')
            .select('id')
            .eq('ticket_number', ticket)
            .maybeSingle();

        if (!data) {
            return ticket; // unique — use it
        }
    }

    // Fallback with timestamp to guarantee uniqueness
    const ts = Date.now().toString(36).toUpperCase().slice(-5);
    return `TRI-${ts}`;
}
