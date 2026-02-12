-- Check if any users exist in Supabase Auth
-- Run this to see all users

-- Count total users
SELECT 
  'Total Users' as info,
  COUNT(*) as count
FROM auth.users;

-- List all users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ Not confirmed'
    ELSE '✅ Confirmed'
  END as status
FROM auth.users
ORDER BY created_at DESC;

-- Check for admin user specifically
SELECT 
  'Admin User Check' as info,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ admin@leadmanagement.com does NOT exist - Create it in Authentication → Users'
    ELSE '✅ admin@leadmanagement.com exists'
  END as status
FROM auth.users
WHERE email = 'admin@leadmanagement.com';

-- If no users exist, you need to:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add user" → "Create new user"
-- 3. Create the admin user with email: admin@leadmanagement.com
-- 4. Password: Admin@2024!
-- 5. ✅ CHECK "Auto Confirm"
-- 6. Then run the create-users.sql script

