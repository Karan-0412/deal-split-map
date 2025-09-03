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

    // Subscribe to new messages
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, (payload) => {
        // Create notification from message
        const newNotification: Notification = {
          id: `msg_${payload.new.id}`,
          type: 'message',
          senderId: payload.new.sender_id,
          senderName: 'Unknown User', // This would be fetched from profiles
          message: payload.new.message,
          timestamp: new Date(payload.new.created_at),
          isRead: false
        };

        setNotifications(prev => [newNotification, ...prev]);
        
        // Show popup notification
        setActiveNotification(newNotification);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setActiveNotification(null);
        }, 5000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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