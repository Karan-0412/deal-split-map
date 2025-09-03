import React, { useState, useEffect, createContext, useContext, ReactNode } from "react";
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
  chatRoomId?: string;
}

interface NotificationsValue {
  notifications: Notification[];
  activeNotification: Notification | null;
  dismissNotification: () => void;
  handleReply: (message: string) => Promise<void> | void;
  sendReply: (notification: Notification, message: string) => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  openReplyPopup: (notification: Notification) => void;
  removeNotification: (notificationId: string) => void;
}

const NotificationsContext = createContext<NotificationsValue | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const value = useNotifications();
  return React.createElement(NotificationsContext.Provider, { value }, children as any);
};

export const useNotificationsContext = (): NotificationsValue => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    // Fallback to a local instance if no provider is present
    return useNotifications();
  }
  return ctx;
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let chatRoomIds = new Set<string>();

    const setup = async () => {
      // Load chat rooms for current user
      const { data: rooms, error: roomsError } = await supabase
        .from('chat_rooms')
        .select('id, buyer_id, seller_id')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

      if (roomsError) {
        console.error('Error fetching chat rooms:', roomsError);
        return null;
      }

      chatRoomIds = new Set<string>((rooms || []).map((r: any) => r.id));

      // Load recent messages (not sent by the user) as initial notifications
      if (chatRoomIds.size > 0) {
        const { data: msgs, error: msgsError } = await supabase
          .from('messages')
          .select('id, chat_room_id, sender_id, message, created_at')
          .in('chat_room_id', Array.from(chatRoomIds))
          .order('created_at', { ascending: false })
          .limit(50);

        if (msgsError) {
          console.error('Error fetching messages:', msgsError);
        } else if (msgs) {
          // Fetch profiles for senders in one pass
          const senderIds = Array.from(new Set(msgs.map(m => m.sender_id).filter((id) => id !== user.id)));
          let profilesByUserId: Record<string, { display_name: string | null; avatar_url: string | null }> = {};
          if (senderIds.length > 0) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('user_id, display_name, avatar_url')
              .in('user_id', senderIds);
            (profiles || []).forEach((p: any) => {
              profilesByUserId[p.user_id] = { display_name: p.display_name, avatar_url: p.avatar_url };
            });
          }

          const initialNotifications: Notification[] = msgs
            .filter(m => m.sender_id !== user.id)
            .map((m) => {
              const profile = profilesByUserId[m.sender_id] || {};
              return {
                id: `msg_${m.id}`,
                type: 'message',
                senderId: m.sender_id,
                senderName: (profile as any).display_name || 'Unknown User',
                senderAvatar: (profile as any).avatar_url || undefined,
                message: m.message,
                timestamp: new Date(m.created_at),
                isRead: false,
                chatRoomId: m.chat_room_id,
              } as Notification;
            });

          setNotifications(initialNotifications);
        }
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
              const msg = payload.new as {
                id: string;
                chat_room_id: string;
                sender_id: string;
                message: string;
                created_at: string;
              };

              if (!chatRoomIds.has(msg.chat_room_id)) return;
              if (msg.sender_id === user.id) return;

              const { data: profile } = await supabase
                .from('profiles')
                .select('display_name, avatar_url')
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
                chatRoomId: msg.chat_room_id,
              };

              setNotifications((prev) => [newNotification, ...prev]);
              setActiveNotification(newNotification);

              // Auto-hide after 8 seconds
              setTimeout(() => {
                setActiveNotification(null);
              }, 8000);
            } catch (e) {
              console.error('Notification handling error:', e);
            }
          }
        )
        .subscribe();

      return channel;
    };

    const channelPromise = setup();

    return () => {
      channelPromise.then((channel) => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, [user]);

  const dismissNotification = () => {
    setActiveNotification(null);
  };

  const openReplyPopup = (notification: Notification) => {
    setActiveNotification(notification);
  };

  const sendReply = async (notification: Notification, message: string) => {
    if (!user) return;
    try {
      if (notification.chatRoomId) {
        const { error } = await supabase.from('messages').insert({
          chat_room_id: notification.chatRoomId,
          sender_id: user.id,
          message,
          message_type: 'text'
        });
        if (error) throw error;
      } else {
        const { data: rooms, error: roomsError } = await supabase
          .from('chat_rooms')
          .select('id, buyer_id, seller_id')
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
        if (roomsError) throw roomsError;
        const room = (rooms || []).find((r: any) => r.buyer_id === notification.senderId || r.seller_id === notification.senderId);
        if (!room) throw new Error('Chat room not found for reply');
        const { error } = await supabase.from('messages').insert({
          chat_room_id: room.id,
          sender_id: user.id,
          message,
          message_type: 'text'
        });
        if (error) throw error;
      }
    } catch (e) {
      console.error('Failed to send reply:', e);
    }
  };

  const handleReply = async (message: string) => {
    if (!activeNotification || !user) return;
    await sendReply(activeNotification, message);
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

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

const markAllAsRead = async () => {
  if (!user) return;

  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error marking notifications as read:", error.message);
      return;
    }
    setNotifications([]); 
  } catch (err) {
    console.error("🔥 Unexpected error:", err);
  }
};




  return {
    notifications,
    activeNotification,
    dismissNotification,
    handleReply,
    sendReply,
    markAsRead,
    markAllAsRead,
    openReplyPopup,
    removeNotification,
  };
};