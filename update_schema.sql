/*
=====================================================
  TRICULT PROJECT - DATABASE UPDATE SCRIPT
=====================================================

The code has been updated to support:
1. Activity-based sessions (VR Car, RC Excavator, etc.)
2. Admin account card colors
3. Improved session tracking for volunteers

Please run the following SQL commands in your Supabase SQL Editor to update your database schema.
This does NOT delete any existing data, but it adds new columns required by the updated code.
*/

-- 1. Add 'card_color' to profiles (for UI customization)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS card_color TEXT DEFAULT '#00ffff';

-- 2. Add 'activity_id' and 'activity_name' to sessions (for tracking specific activities)
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS activity_id TEXT;

ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS activity_name TEXT;

-- 3. Make 'hub_number' optional in sessions (since we now use activity_id)
ALTER TABLE sessions 
ALTER COLUMN hub_number DROP NOT NULL;

/*
AFTER RUNNING THIS:
1. Run "node setup-admin.js" in your terminal to reset data and create new admin accounts.
2. Run "node generate-qr-codes.js" to create the new activity QR codes.
*/
