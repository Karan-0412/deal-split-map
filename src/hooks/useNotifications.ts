import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  type: 'message' | 'match' | 'deal' | 'system';
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const setupNotifications = async () => {
      console.log('Setting up notifications for user:', user.id);
      
      // Get all chat rooms the user is part of
      const { data: rooms, error: roomsError } = await supabase
        .from('chat_rooms')
        .select('id, buyer_id, seller_id')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

      if (roomsError) {
        console.error('Error fetching chat rooms:', roomsError);
        return;
      }

      const chatRoomIds = new Set<string>();
      if (rooms) {
        rooms.forEach((room: any) => chatRoomIds.add(room.id));
        console.log('Monitoring chat rooms:', Array.from(chatRoomIds));
      }

      // Subscribe to new messages
      const channel = supabase
        .channel(`notifications-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          async (payload) => {
            try {
              console.log('New message received:', payload.new);
              const msg = payload.new as {
                id: string;
                chat_room_id: string;
                sender_id: string;
                message: string;
                created_at: string;
              };

              // Ignore if not in user's rooms or if it's the user's own message
              if (!chatRoomIds.has(msg.chat_room_id)) {
                console.log('Message not in monitored rooms');
                return;
              }
              
              if (msg.sender_id === user.id) {
                console.log('Ignoring own message');
                return;
              }

              console.log('Processing notification for message:', msg.id);

              // Fetch sender profile
              const { data: profile } = await supabase
                .from('profiles')
                .select('display_name, avatar_url')
                .eq('user_id', msg.sender_id)
                .single();

              console.log('Sender profile:', profile);

              const newNotification: Notification = {
                id: `msg_${msg.id}`,
                type: 'message',
                senderId: msg.sender_id,
                senderName: profile?.display_name || 'Unknown User',
                senderAvatar: profile?.avatar_url || undefined,
                message: msg.message,
                timestamp: new Date(msg.created_at),
                isRead: false,
              };

              console.log('Creating notification:', newNotification);

              setNotifications((prev) => [newNotification, ...prev]);
              setActiveNotification(newNotification);

              // Show toast notification as backup
              toast({
                title: `New message from ${newNotification.senderName}`,
                description: newNotification.message,
              });

              // Notify BOGO to react
              window.dispatchEvent(
                new CustomEvent('bogo:new-message', { detail: { notification: newNotification } })
              );

              console.log('Notification set, will auto-hide in 8 seconds');
              // Auto-hide after 5 seconds
              setTimeout(() => {
                console.log('Auto-hiding notification');
                setActiveNotification(null);
              }, 8000);
            } catch (e) {
              console.error('Notification handling error:', e);
            }
          }
        )
        .subscribe();

      console.log('Subscribed to notifications channel');
      
      return channel;
    };

    const channelPromise = setupNotifications();

    return () => {
      channelPromise.then((channel) => {
        if (channel) {
          console.log('Cleaning up notifications channel');
          supabase.removeChannel(channel);
        }
      });
    };
  }, [user]);

  const dismissNotification = () => {
    console.log('Dismissing notification');
    setActiveNotification(null);
  };

  const handleReply = async (message: string) => {
    if (!activeNotification || !user) return;
    
    console.log('Handling reply:', message);
    // Send reply (this would need proper chat room logic)
    
    // For demo purposes, just dismiss
    setActiveNotification(null);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
  };

  return {
    notifications,
    activeNotification,
    dismissNotification,
    handleReply,
    markAsRead
  };
};