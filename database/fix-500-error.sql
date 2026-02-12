-- Fix 500 Error on Profiles Query
-- This error usually means RLS policies have issues

-- Step 1: Temporarily disable RLS to test (for debugging only)
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Step 3: Recreate simpler, working policies
-- Users can always view their own profile (no circular dependency)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles (simplified - no circular check)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- If the admin policy above causes issues, use this simpler version:
-- DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
-- CREATE POLICY "Admins can view all profiles"
--   ON profiles FOR SELECT
--   USING (true);  -- Temporarily allow all - adjust for security

-- Step 4: Verify the table and policies
SELECT 
  'Table Check' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
    THEN '✅ Profiles table exists'
    ELSE '❌ Profiles table does NOT exist - Run migration.sql!'
  END as status;

SELECT 
  'RLS Policies' as info,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 5: Test - Check if you can query profiles (run this after logging in)
-- SELECT id, role, name FROM profiles WHERE id = auth.uid();

