-- Create storage bucket for chat file uploads
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

-- Create storage policies for chat files
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
