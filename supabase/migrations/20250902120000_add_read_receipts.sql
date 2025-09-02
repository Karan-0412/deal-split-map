-- Add read receipts to chat_rooms
ALTER TABLE chat_rooms 
ADD COLUMN IF NOT EXISTS buyer_last_read_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS seller_last_read_at TIMESTAMP WITH TIME ZONE;

-- Add attachment support to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT;

-- Create index for attachment queries
CREATE INDEX IF NOT EXISTS idx_messages_attachments ON messages(attachment_url, attachment_type);

-- Update RLS policies for messages with attachments
DROP POLICY IF EXISTS "Users can view messages in their chat rooms" ON messages;
CREATE POLICY "Users can view messages in their chat rooms" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE chat_rooms.id = messages.chat_room_id 
            AND (chat_rooms.buyer_id = auth.uid() OR chat_rooms.seller_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can insert messages in their chat rooms" ON messages;
CREATE POLICY "Users can insert messages in their chat rooms" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE chat_rooms.id = messages.chat_room_id 
            AND (chat_rooms.buyer_id = auth.uid() OR chat_rooms.seller_id = auth.uid())
        )
        AND messages.sender_id = auth.uid()
    );

