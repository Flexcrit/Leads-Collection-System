-- Check if lead_feedback table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'lead_feedback'
) AS table_exists;

-- If table doesn't exist, you'll need to run create-feedback-table.sql
-- If it exists, check the structure:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'lead_feedback'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'lead_feedback';

