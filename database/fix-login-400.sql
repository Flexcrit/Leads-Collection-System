-- Quick Fix Script for 400 Login Error
-- Run this in Supabase SQL Editor to fix login issues

-- Step 1: Confirm all user emails (most common fix for 400 error)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email IN (
  'admin@leadmanagement.com',
  'agent1@leadmanagement.com',
  'agent2@leadmanagement.com',
  'agent3@leadmanagement.com',
  'agent4@leadmanagement.com',
  'agent5@leadmanagement.com'
)
AND email_confirmed_at IS NULL;

-- Step 2: Verify users exist and are confirmed
SELECT 
  id,
  email,
  email_confirmed_at,
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

-- Step 3: Verify profiles exist for all users
SELECT 
  p.id,
  p.name,
  p.role,
  u.email,
  u.email_confirmed_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email IN (
  'admin@leadmanagement.com',
  'agent1@leadmanagement.com',
  'agent2@leadmanagement.com',
  'agent3@leadmanagement.com',
  'agent4@leadmanagement.com',
  'agent5@leadmanagement.com'
)
ORDER BY p.role, u.email;

-- Step 4: If any profiles are missing, create them
-- (This will only insert if they don't exist)
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

