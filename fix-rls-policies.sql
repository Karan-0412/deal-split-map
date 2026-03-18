-- FIXED SQL Migration - No Infinite Recursion
-- Run this to fix the RLS policy issue

-- 1. Drop the problematic policies first
DROP POLICY IF EXISTS "Users can view participants of requests they joined" ON request_participants;
DROP POLICY IF EXISTS "Users can join requests" ON request_participants;
DROP POLICY IF EXISTS "Users can leave requests" ON request_participants;

-- 2. Create simpler, non-recursive policies
CREATE POLICY "Users can view participants of requests they joined" ON accrequest_participants
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can join requests" ON request_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave requests" ON request_participants
  FOR UPDATE USING (user_id = auth.uid());

-- 3. Also fix group_chat_participants policies
DROP POLICY IF EXISTS "Users can view participants of chats they're in" ON group_chat_participants;
DROP POLICY IF EXISTS "Users can join group chats" ON group_chat_participants;
DROP POLICY IF EXISTS "Users can leave group chats" ON group_chat_participants;

CREATE POLICY "Users can view participants of chats they're in" ON group_chat_participants
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can join group chats" ON group_chat_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave group chats" ON group_chat_participants
  FOR DELETE USING (user_id = auth.uid());

-- 4. Make sure all requests are active
UPDATE requests 
SET status = 'active' 
WHERE status = 'completed';

-- 5. Add people_required column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'requests' AND column_name = 'people_required') THEN
        ALTER TABLE requests ADD COLUMN people_required INTEGER DEFAULT 2;
    END IF;
END $$;

-- 6. Update existing requests
UPDATE requests 
SET people_required = 2 
WHERE people_required IS NULL;

-- 7. Check results
SELECT id, title, status, people_required, created_at 
FROM requests 
ORDER BY created_at DESC;







