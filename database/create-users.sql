-- Script to create profiles for 1 admin and 5 agents
-- IMPORTANT: You must create the users in Supabase Auth first, then run this script

-- Step 1: Create users in Supabase Dashboard
-- Go to Authentication → Users → Add user
-- Create these 6 users with UNIQUE passwords:
-- 1. admin@leadmanagement.com (password: Admin@2024!)
-- 2. agent1@leadmanagement.com (password: Agent1@2024!)
-- 3. agent2@leadmanagement.com (password: Agent2@2024!)
-- 4. agent3@leadmanagement.com (password: Agent3@2024!)
-- 5. agent4@leadmanagement.com (password: Agent4@2024!)
-- 6. agent5@leadmanagement.com (password: Agent5@2024!)

-- Step 2: After creating users, get their IDs from auth.users table
-- Run this query to see all users:
-- SELECT id, email FROM auth.users ORDER BY created_at;

-- Step 3: Update the IDs below with actual user IDs from Step 2, then run this script

-- Create Admin Profile
-- Replace 'ADMIN_USER_ID' with the actual UUID from auth.users for admin@leadmanagement.com
INSERT INTO profiles (id, role, name)
SELECT 
  id,
  'admin',
  'Admin User'
FROM auth.users
WHERE email = 'admin@leadmanagement.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', name = 'Admin User';

-- Create Agent Profiles
-- Replace with actual UUIDs from auth.users for each agent
INSERT INTO profiles (id, role, name)
SELECT 
  id,
  'agent',
  'Agent 1'
FROM auth.users
WHERE email = 'agent1@leadmanagement.com'
ON CONFLICT (id) DO UPDATE SET role = 'agent', name = 'Agent 1';

INSERT INTO profiles (id, role, name)
SELECT 
  id,
  'agent',
  'Agent 2'
FROM auth.users
WHERE email = 'agent2@leadmanagement.com'
ON CONFLICT (id) DO UPDATE SET role = 'agent', name = 'Agent 2';

INSERT INTO profiles (id, role, name)
SELECT 
  id,
  'agent',
  'Agent 3'
FROM auth.users
WHERE email = 'agent3@leadmanagement.com'
ON CONFLICT (id) DO UPDATE SET role = 'agent', name = 'Agent 3';

INSERT INTO profiles (id, role, name)
SELECT 
  id,
  'agent',
  'Agent 4'
FROM auth.users
WHERE email = 'agent4@leadmanagement.com'
ON CONFLICT (id) DO UPDATE SET role = 'agent', name = 'Agent 4';

INSERT INTO profiles (id, role, name)
SELECT 
  id,
  'agent',
  'Agent 5'
FROM auth.users
WHERE email = 'agent5@leadmanagement.com'
ON CONFLICT (id) DO UPDATE SET role = 'agent', name = 'Agent 5';

-- Verify the profiles were created
SELECT 
  p.id,
  p.name,
  p.role,
  u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.role, p.name;

