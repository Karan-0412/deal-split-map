-- Comprehensive fix for group chat RLS policies
-- This script fixes the RLS policies to properly support group chats

-- First, let's check what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('messages', 'chat_rooms', 'request_participants', 'group_chat_participants');

-- Drop all existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view messages in their chat rooms" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their chat rooms" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their chat rooms" ON messages;

DROP POLICY IF EXISTS "Users can view chat rooms they are part of" ON chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms" ON chat_rooms;

DROP POLICY IF EXISTS "Users can view participants of requests they joined" ON request_participants;
DROP POLICY IF EXISTS "Users can join requests" ON request_participants;
DROP POLICY IF EXISTS "Users can leave requests" ON request_participants;

DROP POLICY IF EXISTS "Users can view participants of chats they're in" ON group_chat_participants;
DROP POLICY IF EXISTS "Users can join group chats" ON group_chat_participants;
DROP POLICY IF EXISTS "Users can leave group chats" ON group_chat_participants;

-- Create new, comprehensive policies for messages
CREATE POLICY "Users can view messages in their chat rooms" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE chat_rooms.id = messages.chat_room_id 
            AND (
                -- Direct chat: user is buyer or seller
                (chat_rooms.room_type = 'direct' AND (chat_rooms.buyer_id = auth.uid() OR chat_rooms.seller_id = auth.uid()))
                OR
                -- Group chat: user is a participant
                (chat_rooms.room_type = 'group' AND EXISTS (
                    SELECT 1 FROM group_chat_participants 
                    WHERE group_chat_participants.chat_room_id = chat_rooms.id 
                    AND group_chat_participants.user_id = auth.uid()
                ))
                OR
                -- Fallback: if room_type is null, check buyer/seller (for backward compatibility)
                (chat_rooms.room_type IS NULL AND (chat_rooms.buyer_id = auth.uid() OR chat_rooms.seller_id = auth.uid()))
            )
        )
    );

CREATE POLICY "Users can insert messages in their chat rooms" ON messages
    FOR INSERT WITH CHECK (
        messages.sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE chat_rooms.id = messages.chat_room_id 
            AND (
                -- Direct chat: user is buyer or seller
                (chat_rooms.room_type = 'direct' AND (chat_rooms.buyer_id = auth.uid() OR chat_rooms.seller_id = auth.uid()))
                OR
                -- Group chat: user is a participant
                (chat_rooms.room_type = 'group' AND EXISTS (
                    SELECT 1 FROM group_chat_participants 
                    WHERE group_chat_participants.chat_room_id = chat_rooms.id 
                    AND group_chat_participants.user_id = auth.uid()
                ))
                OR
                -- Fallback: if room_type is null, check buyer/seller (for backward compatibility)
                (chat_rooms.room_type IS NULL AND (chat_rooms.buyer_id = auth.uid() OR chat_rooms.seller_id = auth.uid()))
            )
        )
    );

-- Create comprehensive policies for chat_rooms
CREATE POLICY "Users can view chat rooms they are part of" ON chat_rooms
    FOR SELECT USING (
        -- Direct chat: user is buyer or seller
        (room_type = 'direct' AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
        OR
        -- Group chat: user is a participant
        (room_type = 'group' AND EXISTS (
            SELECT 1 FROM group_chat_participants 
            WHERE group_chat_participants.chat_room_id = chat_rooms.id 
            AND group_chat_participants.user_id = auth.uid()
        ))
        OR
        -- Fallback: if room_type is null, check buyer/seller (for backward compatibility)
        (room_type IS NULL AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
    );

CREATE POLICY "Users can create chat rooms" ON chat_rooms
    FOR INSERT WITH CHECK (
        -- Direct chat: user is buyer or seller
        (room_type = 'direct' AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
        OR
        -- Group chat: user is the creator
        (room_type = 'group' AND created_by = auth.uid())
        OR
        -- Fallback: if room_type is null, check buyer/seller (for backward compatibility)
        (room_type IS NULL AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
    );

-- Create policies for request_participants
CREATE POLICY "Users can view participants of requests they joined" ON request_participants
    FOR SELECT USING (
        -- User can see participants of requests they've joined
        EXISTS (
            SELECT 1 FROM request_participants rp2 
            WHERE rp2.request_id = request_participants.request_id 
            AND rp2.user_id = auth.uid()
        )
        OR
        -- User can see participants of requests they created
        EXISTS (
            SELECT 1 FROM requests r 
            WHERE r.id = request_participants.request_id 
            AND r.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join requests" ON request_participants
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave requests" ON request_participants
    FOR UPDATE USING (user_id = auth.uid());

-- Create policies for group_chat_participants
CREATE POLICY "Users can view participants of chats they're in" ON group_chat_participants
    FOR SELECT USING (
        -- User can see participants of group chats they're in
        EXISTS (
            SELECT 1 FROM group_chat_participants gcp2 
            WHERE gcp2.chat_room_id = group_chat_participants.chat_room_id 
            AND gcp2.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join group chats" ON group_chat_participants
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave group chats" ON group_chat_participants
    FOR DELETE USING (user_id = auth.uid());

-- Verify the policies were created
SELECT 'RLS policies updated successfully!' as status;
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('messages', 'chat_rooms', 'request_participants', 'group_chat_participants')
ORDER BY tablename, policyname;







