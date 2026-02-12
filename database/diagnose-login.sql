-- Diagnostic Script for 400 Login Error
-- Run this to see what's wrong with your users

-- 1. Check if users exist in auth.users
SELECT 
  'Users in auth.users' as check_type,
  id,
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ NOT CONFIRMED'
    ELSE '✅ CONFIRMED'
  END as status,
  created_at
FROM auth.users
WHERE email IN (
  'admin@leadmanagement.com',
  'agent1@leadmanagement.com',
  'agent2@leadmanagement.com',
  'agent3@leadmanagement.com',
  'agent4@leadmanagement.com',
  'agent5@leadmanagement.com'
)
ORDER BY email;

-- 2. Check if profiles exist
SELECT 
  'Profiles check' as check_type,
  p.id,
  p.name,
  p.role,
  u.email,
  CASE 
    WHEN p.id IS NULL THEN '❌ PROFILE MISSING'
    ELSE '✅ PROFILE EXISTS'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email IN (
  'admin@leadmanagement.com',
  'agent1@leadmanagement.com',
  'agent2@leadmanagement.com',
  'agent3@leadmanagement.com',
  'agent4@leadmanagement.com',
  'agent5@leadmanagement.com'
)
ORDER BY u.email;

-- 3. Check email provider status (you'll need to check this in UI)
-- Go to: Authentication → Providers → Email (should be enabled)

-- 4. Fix: Confirm all emails
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email IN (
  'admin@leadmanagement.com',
  'agent1@leadmanagement.com',
  'agent2@leadmanagement.com',
  'agent3@leadmanagement.com',
  'agent4@leadmanagement.com',
  'agent5@leadmanagement.com'
);

-- 5. Fix: Create missing profiles
INSERT INTO profiles (id, role, name)
SELECT 
  u.id,
  CASE 
    WHEN u.email = 'admin@leadmanagement.com' THEN 'admin'
    ELSE 'agent'
  END,
  CASE 
    WHEN u.email = 'admin@leadmanagement.com' THEN 'Admin User'
    WHEN u.email = 'agent1@leadmanagement.com' THEN 'Agent 1'
    WHEN u.email = 'agent2@leadmanagement.com' THEN 'Agent 2'
    WHEN u.email = 'agent3@leadmanagement.com' THEN 'Agent 3'
    WHEN u.email = 'agent4@leadmanagement.com' THEN 'Agent 4'
    WHEN u.email = 'agent5@leadmanagement.com' THEN 'Agent 5'
    ELSE 'User'
  END
FROM auth.users u
WHERE u.email IN (
  'admin@leadmanagement.com',
  'agent1@leadmanagement.com',
  'agent2@leadmanagement.com',
  'agent3@leadmanagement.com',
  'agent4@leadmanagement.com',
  'agent5@leadmanagement.com'
)
AND NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- 6. Final verification
SELECT 
  'Final Status' as check_type,
  u.email,
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
WHERE u.email IN (
  'admin@leadmanagement.com',
  'agent1@leadmanagement.com',
  'agent2@leadmanagement.com',
  'agent3@leadmanagement.com',
  'agent4@leadmanagement.com',
  'agent5@leadmanagement.com'
)
ORDER BY u.email;

