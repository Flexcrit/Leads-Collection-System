-- Verify and Fix Admin User
-- Run this to check if user exists and fix any issues

-- Step 1: Check if user exists in auth.users
SELECT 
  'Checking if user exists...' as step,
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN id IS NULL THEN '❌ USER DOES NOT EXIST - Create it in Supabase Dashboard!'
    WHEN email_confirmed_at IS NULL THEN '❌ Email not confirmed - Will fix this'
    ELSE '✅ User exists and email is confirmed'
  END as status
FROM auth.users
WHERE email = 'admin@leadmanagement.com';

-- Step 2: If user exists, confirm email
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'admin@leadmanagement.com'
AND email_confirmed_at IS NULL;

-- Step 3: Check/create profile
INSERT INTO profiles (id, role, name)
SELECT 
  id,
  'admin',
  'Admin User'
FROM auth.users
WHERE email = 'admin@leadmanagement.com'
AND NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.users.id
)
ON CONFLICT (id) DO UPDATE SET role = 'admin', name = 'Admin User';

-- Step 4: Final verification
SELECT 
  'Final Status' as step,
  u.email,
  CASE 
    WHEN u.id IS NULL THEN '❌ USER DOES NOT EXIST'
    ELSE '✅ User exists'
  END as user_status,
  CASE 
    WHEN u.email_confirmed_at IS NULL THEN '❌ Email not confirmed'
    ELSE '✅ Email confirmed'
  END as email_status,
  CASE 
    WHEN p.id IS NULL THEN '❌ Profile missing'
    ELSE '✅ Profile exists'
  END as profile_status,
  p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'admin@leadmanagement.com';

-- If the query above shows "USER DOES NOT EXIST", you need to:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add user" → "Create new user"
-- 3. Email: admin@leadmanagement.com
-- 4. Password: Admin@2024!
-- 5. ✅ CHECK "Auto Confirm"
-- 6. Click "Create user"
-- 7. Then run this script again

