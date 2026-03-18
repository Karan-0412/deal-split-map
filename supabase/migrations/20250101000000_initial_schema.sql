-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  rating DECIMAL(3,2) DEFAULT 0.0,
  total_ratings INTEGER DEFAULT 0,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.categories (name, icon, color) VALUES
  ('Electronics', '📱', 'hsl(220 85% 34%)'),
  ('Fashion', '👕', 'hsl(320 85% 34%)'),
  ('Groceries', '🛒', 'hsl(120 85% 34%)'),
  ('Books', '📚', 'hsl(30 85% 34%)'),
  ('Sports', '⚽', 'hsl(180 85% 34%)'),
  ('Home & Garden', '🏠', 'hsl(260 85% 34%)'),
  ('Beauty', '💄', 'hsl(340 85% 34%)'),
  ('Automotive', '🚗', 'hsl(200 85% 34%)')
ON CONFLICT DO NOTHING;

-- Enable RLS for categories (public read-only)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (true);

-- Create requests table
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  title TEXT NOT NULL,
  description TEXT,
  location_lat DECIMAL(10,8) NOT NULL,
  location_lng DECIMAL(11,8) NOT NULL,
  address TEXT,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'matched', 'completed', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE,
  people_required INTEGER DEFAULT 2,
  product_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Create policies for requests
CREATE POLICY "Requests are viewable by everyone" 
ON public.requests 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own requests" 
ON public.requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests" 
ON public.requests 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create request_participants table
CREATE TABLE IF NOT EXISTS public.request_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'left', 'removed')),
  UNIQUE(request_id, user_id)
);

-- Enable RLS for request_participants
ALTER TABLE public.request_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for request_participants
CREATE POLICY "Users can view participants of requests they joined" ON public.request_participants
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can join requests" ON public.request_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave requests" ON public.request_participants
  FOR UPDATE USING (user_id = auth.uid());

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  room_type TEXT DEFAULT 'direct' CHECK (room_type IN ('direct', 'group')),
  room_name TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_last_read_at TIMESTAMP WITH TIME ZONE,
  seller_last_read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(request_id, buyer_id, seller_id)
);

-- Enable RLS
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachment_url TEXT,
  attachment_type TEXT,
  attachment_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create group_chat_participants table
CREATE TABLE IF NOT EXISTS public.group_chat_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  UNIQUE(chat_room_id, user_id)
);

-- Enable RLS for group_chat_participants
ALTER TABLE public.group_chat_participants ENABLE ROW LEVEL SECURITY;

-- Now create all policies after all tables exist

-- Create policies for chat_rooms
CREATE POLICY "Users can view chat rooms they are part of" 
ON public.chat_rooms 
FOR SELECT 
USING (
  (room_type = 'direct' AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
  OR
  (room_type = 'group' AND EXISTS (
    SELECT 1 FROM public.group_chat_participants gcp
    WHERE gcp.chat_room_id = chat_rooms.id
    AND gcp.user_id = auth.uid()
  ))
  OR
  (room_type IS NULL AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
);

CREATE POLICY "Users can create chat rooms" 
ON public.chat_rooms 
FOR INSERT WITH CHECK (
  (room_type = 'direct' AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
  OR
  (room_type = 'group' AND created_by = auth.uid())
  OR
  (room_type IS NULL AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
);

-- Create policies for messages
CREATE POLICY "Users can view messages in their chat rooms" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms cr
      WHERE cr.id = messages.chat_room_id 
      AND (
        (cr.room_type = 'direct' AND (cr.buyer_id = auth.uid() OR cr.seller_id = auth.uid()))
        OR
        (cr.room_type = 'group' AND EXISTS (
          SELECT 1 FROM public.group_chat_participants gcp
          WHERE gcp.chat_room_id = cr.id
          AND gcp.user_id = auth.uid()
        ))
        OR
        (cr.room_type IS NULL AND (cr.buyer_id = auth.uid() OR cr.seller_id = auth.uid()))
      )
    )
  );

CREATE POLICY "Users can send messages in their chat rooms" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.chat_rooms cr
      WHERE cr.id = messages.chat_room_id 
      AND (
        (cr.room_type = 'direct' AND (cr.buyer_id = auth.uid() OR cr.seller_id = auth.uid()))
        OR
        (cr.room_type = 'group' AND EXISTS (
          SELECT 1 FROM public.group_chat_participants gcp
          WHERE gcp.chat_room_id = cr.id
          AND gcp.user_id = auth.uid()
        ))
        OR
        (cr.room_type IS NULL AND (cr.buyer_id = auth.uid() OR cr.seller_id = auth.uid()))
      )
    )
  );

-- Create policies for group_chat_participants
CREATE POLICY "Users can view participants of chats they're in" ON public.group_chat_participants
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can join group chats" ON public.group_chat_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave group chats" ON public.group_chat_participants
  FOR DELETE USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON public.requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_category_id ON public.requests(category_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_request_participants_request_id ON public.request_participants(request_id);
CREATE INDEX IF NOT EXISTS idx_request_participants_user_id ON public.request_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_buyer_id ON public.chat_rooms(buyer_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_seller_id ON public.chat_rooms(seller_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_room_type ON public.chat_rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_messages_chat_room_id ON public.messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_attachments ON public.messages(attachment_url, attachment_type);
CREATE INDEX IF NOT EXISTS idx_group_chat_participants_chat_room_id ON public.group_chat_participants(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_group_chat_participants_user_id ON public.group_chat_participants(user_id);

-- Enable realtime for tables
ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.group_chat_participants REPLICA IDENTITY FULL;
ALTER TABLE public.request_participants REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.requests REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_chat_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.request_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
