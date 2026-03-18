-- Simple script to add missing group chat features
-- Run this manually in your Supabase SQL editor

-- 1. Add people_required column to requests table (if not exists)
ALTER TABLE public.requests 
ADD COLUMN IF NOT EXISTS people_required INTEGER DEFAULT 2;

-- 2. Add room_type and other columns to chat_rooms table (if not exists)
ALTER TABLE public.chat_rooms 
ADD COLUMN IF NOT EXISTS room_type TEXT DEFAULT 'direct',
ADD COLUMN IF NOT EXISTS room_name TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2a. Modify the unique constraint to allow multiple chats per request for group chats
-- First, drop the existing unique constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chat_rooms_request_id_buyer_id_seller_id_key'
    ) THEN
        ALTER TABLE public.chat_rooms 
        DROP CONSTRAINT chat_rooms_request_id_buyer_id_seller_id_key;
    END IF;
END $$;

-- Create a new unique constraint that allows multiple chats per request for group chats
-- but still prevents duplicate direct chats
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chat_rooms_unique_direct_chat'
    ) THEN
        ALTER TABLE public.chat_rooms 
        ADD CONSTRAINT chat_rooms_unique_direct_chat 
        UNIQUE (request_id, buyer_id, seller_id, room_type) 
        DEFERRABLE INITIALLY DEFERRED;
    END IF;
END $$;

-- 3. Create request_participants table (if not exists)
CREATE TABLE IF NOT EXISTS public.request_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'left', 'removed')),
  UNIQUE(request_id, user_id)
);

-- 4. Create group_chat_participants table (if not exists)
CREATE TABLE IF NOT EXISTS public.group_chat_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  UNIQUE(chat_room_id, user_id)
);

-- 5. Enable RLS for new tables (if not already enabled)
ALTER TABLE public.request_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_chat_participants ENABLE ROW LEVEL SECURITY;

-- 6. Create basic policies for request_participants (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'request_participants' 
        AND policyname = 'Users can view participants of requests they joined'
    ) THEN
        CREATE POLICY "Users can view participants of requests they joined" ON public.request_participants
          FOR SELECT USING (user_id = auth.uid());
    END IF;
END $$;

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

-- 7. Create basic policies for group_chat_participants (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'group_chat_participants' 
        AND policyname = 'Users can view participants of chats they are in'
    ) THEN
        CREATE POLICY "Users can view participants of chats they are in" ON public.group_chat_participants
          FOR SELECT USING (user_id = auth.uid());
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

-- 8. Create indexes for better performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_request_participants_request_id ON public.request_participants(request_id);
CREATE INDEX IF NOT EXISTS idx_request_participants_user_id ON public.request_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_group_chat_participants_chat_room_id ON public.group_chat_participants(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_group_chat_participants_user_id ON public.group_chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_room_type ON public.chat_rooms(room_type);

-- 9. Enable realtime for new tables (if not already enabled)
ALTER TABLE public.request_participants REPLICA IDENTITY FULL;
ALTER TABLE public.group_chat_participants REPLICA IDENTITY FULL;

-- Add tables to realtime publication (if not already added)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'request_participants'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.request_participants;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'group_chat_participants'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.group_chat_participants;
    END IF;
END $$;
