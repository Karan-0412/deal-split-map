-- Remove contacts and related data from Coorder database
-- WARNING: This will permanently delete contact-related data

-- 1. Remove all chat rooms (these represent contact relationships)
DELETE FROM chat_rooms;

-- 2. Remove all messages (these are conversations between contacts)
DELETE FROM messages;

-- 3. Remove all group chat participants (these are contact relationships in groups)
DELETE FROM group_chat_participants;

-- 4. Remove all request participants (these are people who joined requests together)
DELETE FROM request_participants;

-- 5. Remove all notifications (these might contain contact-related notifications)
DELETE FROM notifications;

-- Optional: Reset sequences if you want to start IDs from 1 again
-- ALTER SEQUENCE chat_rooms_id_seq RESTART WITH 1;
-- ALTER SEQUENCE messages_id_seq RESTART WITH 1;
-- ALTER SEQUENCE group_chat_participants_id_seq RESTART WITH 1;
-- ALTER SEQUENCE request_participants_id_seq RESTART WITH 1;
-- ALTER SEQUENCE notifications_id_seq RESTART WITH 1;

-- Check the results
SELECT 
  'chat_rooms' as table_name, COUNT(*) as remaining_records FROM chat_rooms
UNION ALL
SELECT 
  'messages' as table_name, COUNT(*) as remaining_records FROM messages
UNION ALL
SELECT 
  'group_chat_participants' as table_name, COUNT(*) as remaining_records FROM group_chat_participants
UNION ALL
SELECT 
  'request_participants' as table_name, COUNT(*) as remaining_records FROM request_participants
UNION ALL
SELECT 
  'notifications' as table_name, COUNT(*) as remaining_records FROM notifications;

