import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    let chatRoomIds = new Set<string>();

    const setup = async () => {
      // Prefetch chat rooms the user is part of
      const { data: rooms } = await supabase
        .from('chat_rooms')
        .select('id,buyer_id,seller_id')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

      if (rooms && isMounted) {
        rooms.forEach((r: any) => chatRoomIds.add(r.id));
      }

      // Subscribe to new messages (filter in callback)
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          async (payload) => {
            try {
              const msg = payload.new as any;

              // Ignore if not in user's rooms or if it's the user's own message
              if (!chatRoomIds.has(msg.chat_room_id) || msg.sender_id === user.id) return;

              // Fetch sender profile
              const { data: profile } = await supabase
                .from('profiles')
                .select('display_name, avatar_url, user_id')
                .eq('user_id', msg.sender_id)
                .single();

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

              setNotifications((prev) => [newNotification, ...prev]);
              setActiveNotification(newNotification);

              // Notify BOGO to react
              window.dispatchEvent(
                new CustomEvent('bogo:new-message', { detail: { notification: newNotification } })
              );

              // Auto-hide after 5 seconds
              setTimeout(() => setActiveNotification(null), 5000);
            } catch (e) {
              console.error('Notification handling error:', e);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanupPromise = setup();

    return () => {
      isMounted = false;
      // Ensure channel cleaned when setup resolves
      // @ts-ignore - await returned cleanup if any
      cleanupPromise?.then?.((cleanup: any) => cleanup && cleanup());
    };
  }, [user]);

  const dismissNotification = () => {
    setActiveNotification(null);
  };

  const handleReply = async (message: string) => {
    if (!activeNotification || !user) return;
    
    // Send reply (this would need proper chat room logic)
    console.log('Sending reply:', message);
    
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