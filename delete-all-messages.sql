-- Delete all messages from the database
-- WARNING: This will permanently delete ALL messages

DELETE FROM messages;

-- Optional: Reset the sequence if you want to start message IDs from 1 again
-- ALTER SEQUENCE messages_id_seq RESTART WITH 1;

-- Check the result
SELECT COUNT(*) as remaining_messages FROM messages;

