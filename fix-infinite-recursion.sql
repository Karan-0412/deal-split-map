-- Fix infinite recursion in RLS policies
-- Run this in your Supabase SQL editor to fix the current error

-- 1. Drop problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view participants of requests they joined" ON public.request_participants;
DROP POLICY IF EXISTS "Users can view participants of chats they are in" ON public.group_chat_participants;

-- 2. Create simple, non-recursive policies
CREATE POLICY "Users can view participants of requests they joined" ON public.request_participants
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view participants of chats they are in" ON public.group_chat_participants
  FOR SELECT USING (user_id = auth.uid());

-- 3. Add other essential policies if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'request_participants' 
        AND policyname = 'Users can join requests'
    ) THEN
        CREATE POLICY "Users can join requests" ON public.request_participants
          FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'request_participants' 
        AND policyname = 'Users can leave requests'
    ) THEN
        CREATE POLICY "Users can leave requests" ON public.request_participants
          FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'group_chat_participants' 
        AND policyname = 'Users can join group chats'
    ) THEN
        CREATE POLICY "Users can join group chats" ON public.group_chat_participants
          FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'group_chat_participants' 
        AND policyname = 'Users can leave group chats'
    ) THEN
        CREATE POLICY "Users can leave group chats" ON public.group_chat_participants
          FOR DELETE USING (user_id = auth.uid());
    END IF;
END $$;






