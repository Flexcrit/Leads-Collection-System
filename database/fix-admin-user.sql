-- Fix script specifically for admin@leadmanagement.com
-- Run this in Supabase SQL Editor

-- Step 1: Check if user exists
SELECT 
  'User Check' as step,
  id,
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ NOT CONFIRMED - This is likely the problem!'
    ELSE '✅ CONFIRMED'
  END as status,
  created_at
FROM auth.users
WHERE email = 'admin@leadmanagement.com';

-- Step 2: Fix - Confirm the email
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'admin@leadmanagement.com'
AND email_confirmed_at IS NULL;

-- Step 3: Create profile if missing
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

-- Step 4: Verify everything is set up correctly
SELECT 
  'Final Verification' as step,
  u.email,
  CASE 
    WHEN u.email_confirmed_at IS NULL THEN '❌ Email NOT confirmed - Run Step 2 again'
    ELSE '✅ Email confirmed'
  END as email_status,
  CASE 
    WHEN p.id IS NULL THEN '❌ Profile missing - Run Step 3 again'
    ELSE '✅ Profile exists'
  END as profile_status,
  p.role,
  p.name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'admin@leadmanagement.com';

-- Step 5: If user doesn't exist, you need to create it manually in Supabase Dashboard
-- Go to: Authentication → Users → Add user
-- Email: admin@leadmanagement.com
-- Password: Admin@2024!
-- ✅ CHECK "Auto Confirm"
-- Then run Steps 2-4 again

