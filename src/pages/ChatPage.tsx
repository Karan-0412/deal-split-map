import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';

interface ChatRoom {
  id: string;
  request_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  buyer_last_read_at?: string;
  seller_last_read_at?: string;
  requests: {
    title: string;
  };
  buyer_profile: {
    display_name: string;
    avatar_url: string;
  };
  seller_profile: {
    display_name: string;
    avatar_url: string;
  };
}

interface Message {
  id: string;
  chat_room_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  profiles: {
    display_name: string;
    avatar_url: string;
  };
}

const ChatPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedRoom]);

  useEffect(() => {
    if (user) {
      fetchChatRooms();
    }
  }, [user]);

  // Auto-select first room if none selected and there's no requestId param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasRequestId = params.has('requestId');
    if (!selectedRoom && chatRooms.length > 0 && !hasRequestId) {
      setSelectedRoom(chatRooms[0].id);
    }
  }, [chatRooms, selectedRoom, location.search]);

  // When rooms are loaded or URL changes, auto-open/create for requestId
  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(location.search);
    const requestId = params.get('requestId');
    if (!requestId) return;

    const ensureRoom = async () => {
      // Try to find an existing room for this request
      const existing = chatRooms.find(r => r.request_id === requestId);
      if (existing) {
        setSelectedRoom(existing.id);
        return;
      }

      // Fetch request to determine owner (seller)
      const { data: req } = await supabase
        .from('requests')
        .select('id, user_id')
        .eq('id', requestId)
        .single();

      if (!req) return;

      const buyerId = user.id;
      const sellerId = req.user_id;
      if (buyerId === sellerId) return; // Avoid self-room

      // Create a room if not exists between these users for this request
      const { data: newRooms, error } = await supabase
        .from('chat_rooms')
        .insert({ request_id: requestId, buyer_id: buyerId, seller_id: sellerId })
        .select('*');

      if (!error && newRooms && newRooms[0]) {
        // Refresh rooms list and select
        await fetchChatRooms();
        setSelectedRoom(newRooms[0].id);
      }
    };

    ensureRoom();
  }, [location.search, user, chatRooms]);

  useEffect(() => {
    if (!selectedRoom) return;
    fetchMessages();
    const cleanup = subscribeToMessages();
    return cleanup;
  }, [selectedRoom]);

  const fetchChatRooms = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        requests (title)
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

    if (data) {
      // Fetch buyer and seller profiles separately
      const roomsWithProfiles = await Promise.all(
        data.map(async (room) => {
          const [buyerResult, sellerResult] = await Promise.all([
            supabase.from('profiles').select('display_name, avatar_url').eq('user_id', room.buyer_id).single(),
            supabase.from('profiles').select('display_name, avatar_url').eq('user_id', room.seller_id).single()
          ]);

          return {
            ...room,
            buyer_profile: buyerResult.data || { display_name: '', avatar_url: '' },
            seller_profile: sellerResult.data || { display_name: '', avatar_url: '' }
          };
        })
      );

      setChatRooms(roomsWithProfiles as ChatRoom[]);
    }
    setLoading(false);
  };

  const fetchMessages = async () => {
    if (!selectedRoom) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_room_id', selectedRoom)
      .order('created_at', { ascending: true });

    if (data) {
      // Fetch profiles separately
      const messagesWithProfiles = await Promise.all(
        data.map(async (message) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', message.sender_id)
            .single();

          return {
            ...message,
            profiles: profile || { display_name: '', avatar_url: '' }
          };
        })
      );

      setMessages(messagesWithProfiles as Message[]);
    }
  };

  const subscribeToMessages = () => {
    if (!selectedRoom) return;

    const subscription = supabase
      .channel(`room-${selectedRoom}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${selectedRoom}`
        },
        async (payload) => {
          // Fetch the complete message with profile data
          const { data: message } = await supabase
            .from('messages')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (message) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('user_id', message.sender_id)
              .single();

            const messageWithProfile = {
              ...message,
              profiles: profile || { display_name: '', avatar_url: '' }
            };

            setMessages(prev => {
              // Replace any pending message from same sender with same content
              const withoutPending = prev.filter(m => !(
                (m as any).id?.toString().startsWith('pending-') &&
                m.sender_id === messageWithProfile.sender_id &&
                m.message === messageWithProfile.message
              ));
              return [...withoutPending, messageWithProfile as Message];
            });
          }
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom || !user) return;

    // Optimistic UI: show the message immediately
    const optimistic: Message = {
      id: `pending-${Date.now()}`,
      chat_room_id: selectedRoom,
      sender_id: user.id,
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
      profiles: {
        display_name: '',
        avatar_url: ''
      }
    };
    setMessages(prev => [...prev, optimistic]);
    const toSend = newMessage.trim();
    setNewMessage('');

    const { error } = await supabase
      .from('messages')
      .insert({
        chat_room_id: selectedRoom,
        sender_id: user.id,
        message: toSend
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      // Rollback optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
    }
  };

  const getOtherUser = (room: ChatRoom) => {
    if (!user) return null;
    return user.id === room.buyer_id ? room.seller_profile : room.buyer_profile;
  };

  const getMyLastReadAt = (room: ChatRoom) => {
    if (!user) return undefined;
    return user.id === room.buyer_id ? room.buyer_last_read_at : room.seller_last_read_at;
  };

  const getUnreadForRoom = (room: ChatRoom) => {
    const lastRead = getMyLastReadAt(room);
    if (!lastRead) return true;
    const lastReadDate = new Date(lastRead);
    // Unread if there exists any message newer than lastRead
    const latest = messages.length > 0 ? new Date(messages[messages.length - 1].created_at) : null;
    return latest ? latest > lastReadDate : false;
  };

  const markRoomAsRead = async (roomId: string) => {
    if (!user) return;
    const room = chatRooms.find(r => r.id === roomId);
    if (!room) return;
    if (user.id === room.buyer_id) {
      await supabase.from('chat_rooms').update({ buyer_last_read_at: new Date().toISOString() }).eq('id', roomId);
    } else {
      await supabase.from('chat_rooms').update({ seller_last_read_at: new Date().toISOString() }).eq('id', roomId);
    }
    // Optimistically update local state
    setChatRooms(prev => prev.map(r => r.id === roomId ? {
      ...r,
      buyer_last_read_at: user.id === r.buyer_id ? new Date().toISOString() : r.buyer_last_read_at,
      seller_last_read_at: user.id === r.seller_id ? new Date().toISOString() : r.seller_last_read_at
    } : r));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Please sign in to access chat</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
          {/* Chat Rooms List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Conversations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading conversations...
                </div>
              ) : chatRooms.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Join a request to start chatting</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {chatRooms.map((room) => {
                    const otherUser = getOtherUser(room);
                    return (
                      <div
                        key={room.id}
                        onClick={() => { setSelectedRoom(room.id); markRoomAsRead(room.id); }}
                        className={`p-4 cursor-pointer hover:bg-muted transition-colors ${
                          selectedRoom === room.id ? 'bg-muted' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={otherUser?.avatar_url} />
                            <AvatarFallback>
                              {otherUser?.display_name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {otherUser?.display_name}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {room.requests.title}
                            </p>
                          </div>
                          {getUnreadForRoom(room) && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" aria-label="Unread" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedRoom ? (
              <>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      {(() => {
                        const room = chatRooms.find(r => r.id === selectedRoom);
                        const otherUser = room ? getOtherUser(room) : null;
                        return otherUser?.display_name || 'Chat';
                      })()}
                    </span>
                    {/* Ticks: single for sent, double for read on my last message */}
                    {(() => {
                      const room = chatRooms.find(r => r.id === selectedRoom);
                      if (!room || !user) return null;
                      const myMessages = messages.filter(m => m.sender_id === user.id);
                      if (myMessages.length === 0) return null;
                      const lastMyMessage = myMessages[myMessages.length - 1];
                      const otherLastRead = user.id === room.buyer_id ? room.seller_last_read_at : room.buyer_last_read_at;
                      const isRead = otherLastRead ? new Date(otherLastRead) >= new Date(lastMyMessage.created_at) : false;
                      return (
                        <span className="text-xs text-muted-foreground">
                          {isRead ? '✓✓ Read' : '✓ Sent'}
                        </span>
                      );
                    })()}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <form onSubmit={sendMessage} className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                      />
                      <Button type="submit" size="icon">
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center text-center">
                <div>
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    Select a conversation to start chatting
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;