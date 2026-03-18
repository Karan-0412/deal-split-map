-- Fix RLS policies for group chat messages
-- The current policies only check buyer_id/seller_id but group chats use group_chat_participants

-- Drop existing message policies
DROP POLICY IF EXISTS "Users can view messages in their chat rooms" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their chat rooms" ON messages;

-- Create new policies that support both direct and group chats
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
            )
        )
    );

-- Also update chat_rooms policies to support group chats
DROP POLICY IF EXISTS "Users can view chat rooms they are part of" ON chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms" ON chat_rooms;

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
    );

CREATE POLICY "Users can create chat rooms" ON chat_rooms
    FOR INSERT WITH CHECK (
        -- Direct chat: user is buyer or seller
        (room_type = 'direct' AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
        OR
        -- Group chat: user is the creator
        (room_type = 'group' AND created_by = auth.uid())
    );

-- Test the policies
SELECT 'RLS policies updated for group chat support' as status;







