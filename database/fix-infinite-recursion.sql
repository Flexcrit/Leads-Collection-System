-- Fix Infinite Recursion in Profiles RLS Policy
-- The error "infinite recursion detected in policy" means the policy is checking
-- the profiles table while querying the profiles table

-- Step 1: Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Step 2: Create a security definer function to check admin role
-- This avoids the circular dependency
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Step 3: Recreate the admin policy using the function
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Step 4: Alternative simpler approach (if function doesn't work)
-- Uncomment this and comment out Step 2-3 if needed:
-- CREATE POLICY "Admins can view all profiles"
--   ON profiles FOR SELECT
--   USING (
--     id = auth.uid() OR  -- Users can see their own
--     (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
--   );

-- Step 5: Verify policies
SELECT 
  policyname,
  cmd,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 6: Test - This should work now
-- SELECT id, role, name FROM profiles WHERE id = auth.uid();

