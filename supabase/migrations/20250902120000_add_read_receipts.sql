-- Add read receipt timestamps to chat_rooms for per-user read tracking
ALTER TABLE public.chat_rooms
ADD COLUMN IF NOT EXISTS buyer_last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS seller_last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Optional: indexes to speed up unread checks
CREATE INDEX IF NOT EXISTS idx_chat_rooms_buyer_last_read_at ON public.chat_rooms (buyer_last_read_at);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_seller_last_read_at ON public.chat_rooms (seller_last_read_at);

