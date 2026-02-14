-- ============================================
-- Token Transaction System — Supabase Schema
-- ============================================

-- 1. Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  balance_tokens INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  is_volunteer BOOLEAN DEFAULT FALSE,
  card_color TEXT DEFAULT '#00ffff',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('recharge', 'deduction', 'creation')) NOT NULL,
  amount INTEGER NOT NULL,
  hub_number INTEGER, -- Kept for legacy compatibility, or use 0
  duration TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Sessions table (for volunteer monitoring of timed activities)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_number INTEGER NOT NULL, -- Legacy field, use 0 for activity-based
  activity_id TEXT, -- e.g., 'vr_car', 'rc_excavator'
  activity_name TEXT, -- e.g., 'VR Car Station'
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  ticket_number TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT CHECK (status IN ('active', 'expired')) DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- 4. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 5. Permissive RLS policies (internal event tool)
CREATE POLICY "Allow all for anon" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON sessions FOR ALL USING (true) WITH CHECK (true);

-- 6. SEED DATA IS NOW HANDLED BY setup-admin.js
--    Run 'npm run setup' (or node setup-admin.js) to initialize admins
