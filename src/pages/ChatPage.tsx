import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';

interface ChatRoom {
  id: string;
  request_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
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
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchChatRooms();
    }
  }, [user]);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [selectedRoom]);

  const fetchChatRooms = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        requests (title)
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .eq('status', 'active')
      .order('updated_at', { ascending: false });

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

            setMessages(prev => [...prev, messageWithProfile as Message]);
          }
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom || !user) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        chat_room_id: selectedRoom,
        sender_id: user.id,
        message: newMessage.trim()
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } else {
      setNewMessage('');
    }
  };

  const getOtherUser = (room: ChatRoom) => {
    if (!user) return null;
    return user.id === room.buyer_id ? room.seller_profile : room.buyer_profile;
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
                        onClick={() => setSelectedRoom(room.id)}
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
                  <CardTitle>
                    {(() => {
                      const room = chatRooms.find(r => r.id === selectedRoom);
                      const otherUser = room ? getOtherUser(room) : null;
                      return otherUser?.display_name || 'Chat';
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