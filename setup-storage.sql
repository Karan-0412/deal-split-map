-- ========================================
-- SUPABASE STORAGE SETUP FOR CHAT FILES
-- ========================================
-- Run this in your Supabase SQL editor

-- 1. Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'chat-files',
    'chat-files',
    true,
    52428800, -- 50MB limit
    ARRAY[
        'image/*',
        'video/*',
        'audio/*',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/zip',
        'application/x-rar-compressed'
    ]
) ON CONFLICT (id) DO NOTHING;

-- 2. Create storage policies for chat files
-- Policy for uploading files
CREATE POLICY "Users can upload files to their chat rooms" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'chat-files' AND
        (storage.foldername(name))[1] = 'chat-attachments' AND
        EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE chat_rooms.id = (storage.foldername(name))[2]::uuid
            AND (chat_rooms.buyer_id = auth.uid() OR chat_rooms.seller_id = auth.uid())
        )
    );

-- Policy for viewing files
CREATE POLICY "Users can view files from their chat rooms" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'chat-files' AND
        (storage.foldername(name))[1] = 'chat-attachments' AND
        EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE chat_rooms.id = (storage.foldername(name))[2]::uuid
            AND (chat_rooms.buyer_id = auth.uid() OR chat_rooms.seller_id = auth.uid())
        )
    );

-- Policy for deleting files
CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'chat-files' AND
        (storage.foldername(name))[1] = 'chat-attachments' AND
        EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE chat_rooms.id = (storage.foldername(name))[2]::uuid
            AND (chat_rooms.buyer_id = auth.uid() OR chat_rooms.seller_id = auth.uid())
        )
    );

-- 3. Add attachment columns to messages table if they don't exist
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT;

-- 4. Create index for attachment queries
CREATE INDEX IF NOT EXISTS idx_messages_attachments ON messages(attachment_url, attachment_type);

-- 5. Verify the setup
SELECT 
    'Storage bucket created successfully' as status,
    id, name, public, file_size_limit
FROM storage.buckets 
WHERE id = 'chat-files';

SELECT 
    'Storage policies created successfully' as status,
    policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
