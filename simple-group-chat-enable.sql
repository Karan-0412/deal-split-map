-- Simple group chat enablement - just add the essential columns
-- Run this in your Supabase SQL editor

-- 1. Add people_required column to requests table (if not exists)
ALTER TABLE public.requests 
ADD COLUMN IF NOT EXISTS people_required INTEGER DEFAULT 2;

-- 2. Add room_type and other columns to chat_rooms table (if not exists)
ALTER TABLE public.chat_rooms 
ADD COLUMN IF NOT EXISTS room_type TEXT DEFAULT 'direct',
ADD COLUMN IF NOT EXISTS room_name TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_room_type ON public.chat_rooms(room_type);

-- 4. Update existing chat_rooms to have room_type = 'direct' if null
UPDATE public.chat_rooms 
SET room_type = 'direct' 
WHERE room_type IS NULL;






