
import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, Smile, Paperclip, X, File, Image, FileText, Video, Music } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
  profiles: {
    display_name: string;
    avatar_url: string;
  };
}

interface FileAttachment {
  file: File;
  type: 'image' | 'document' | 'video' | 'audio' | 'other';
  preview?: string;
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [latestByRoom, setLatestByRoom] = useState<Record<string, string>>({});
  const [latestPreviewByRoom, setLatestPreviewByRoom] = useState<Record<string, { text: string; created_at: string; sender_id: string }>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // ===== EMOJI PICKER =====
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
    '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
    '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '🤡', '👹',
    '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼'
  ];

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // ===== FILE HANDLING =====
  const getFileType = (file: File): 'image' | 'document' | 'video' | 'audio' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) return 'document';
    return 'other';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 50MB`,
          variant: "destructive"
        });
        return false;
      }

      // Check file type
      const allowedTypes = [
        'image/', 'video/', 'audio/', 
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'application/zip', 'application/x-rar-compressed'
      ];
      
      const isAllowed = allowedTypes.some(type => file.type.startsWith(type));
      if (!isAllowed) {
        toast({
          title: "File type not supported",
          description: `${file.name} is not a supported file type`,
          variant: "destructive"
        });
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    const newAttachments: FileAttachment[] = validFiles.map(file => ({
      file,
      type: getFileType(file),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));
    
    setSelectedFiles(prev => [...prev, ...newAttachments]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      const removedFile = newFiles[index];
      if (removedFile.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      if (!selectedRoom) {
        console.error('No room selected for file upload');
        return null;
      }

      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size must be less than 50MB",
          variant: "destructive"
        });
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `chat-attachments/${selectedRoom}/${fileName}`;

      console.log('Uploading file:', file.name, 'to path:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Upload failed",
          description: uploadError.message || "Failed to upload file",
          variant: "destructive"
        });
        return null;
      }

      console.log('File uploaded successfully, getting public URL...');

      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Upload error",
        description: "An unexpected error occurred during upload",
        variant: "destructive"
      });
      return null;
    }
  };

  // ===== HELPER FUNCTIONS =====
  
  const getOtherUser = useCallback((room: ChatRoom) => {
    if (!user) return null;
    return user.id === room.buyer_id ? room.seller_profile : room.buyer_profile;
  }, [user]);

  const getMyLastReadAt = useCallback((room: ChatRoom) => {
    if (!user) return undefined;
    return user.id === room.buyer_id ? room.buyer_last_read_at : room.seller_last_read_at;
  }, [user]);

  const markRoomAsRead = useCallback(async (roomId: string) => {
    if (!user) return;
    const room = chatRooms.find(r => r.id === roomId);
    if (!room) return;
    const now = new Date().toISOString();
    if (user.id === room.buyer_id) {
      await supabase.from('chat_rooms').update({ buyer_last_read_at: now } as any).eq('id', roomId);
    } else {
      await supabase.from('chat_rooms').update({ seller_last_read_at: now } as any).eq('id', roomId);
    }
    setChatRooms(prev => prev.map(r => r.id === roomId ? {
      ...r,
      buyer_last_read_at: user.id === r.buyer_id ? now : r.buyer_last_read_at,
      seller_last_read_at: user.id === r.seller_id ? now : r.seller_last_read_at
    } : r));
    setUnreadCounts(prev => ({ ...prev, [roomId]: 0 }));
  }, [user, chatRooms]);

  const fetchChatRooms = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        requests (title)
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

    if (data) {
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

      const previewsEntries = await Promise.all(
        (roomsWithProfiles as ChatRoom[]).map(async (room) => {
          const [latestMsgResult, unreadResult] = await Promise.all([
            supabase
              .from('messages')
              .select('message, created_at, sender_id')
              .eq('chat_room_id', room.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle(),
            supabase
              .from('messages')
              .select('created_at')
              .eq('chat_room_id', room.id)
              .gt('created_at', getMyLastReadAt(room) || '1970-01-01')
              .order('created_at', { ascending: false })
          ]);
          return [room.id, latestMsgResult.data, unreadResult.data] as const;
        })
      );

      const nextPreview: Record<string, { text: string; created_at: string; sender_id: string }> = {};
      const nextLatest: Record<string, string> = {};
      const nextUnreadCounts: Record<string, number> = {};
      for (const [roomId, latestMsg, unreadMsgs] of previewsEntries) {
        if (latestMsg) {
          nextPreview[roomId] = { text: latestMsg.message as string, created_at: latestMsg.created_at as string, sender_id: latestMsg.sender_id as string };
          nextLatest[roomId] = latestMsg.created_at as string;
        }
        nextUnreadCounts[roomId] = unreadMsgs?.length || 0;
      }
      setLatestPreviewByRoom(nextPreview);
      setLatestByRoom(prev => ({ ...nextLatest, ...prev }));
      setUnreadCounts(nextUnreadCounts);
    }
    setLoading(false);
  }, [user, getMyLastReadAt]);

  const fetchMessages = useCallback(async () => {
    if (!selectedRoom) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_room_id', selectedRoom)
      .order('created_at', { ascending: true });

    if (data) {
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
  }, [selectedRoom]);

  const subscribeToMessages = useCallback(() => {
    if (!selectedRoom) return;

    console.log('Subscribing to messages for room:', selectedRoom);

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
          console.log('Received message in chat:', payload.new);
          
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

    console.log('Subscribed to room messages');
    return () => subscription.unsubscribe();
  }, [selectedRoom]);

  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && selectedFiles.length === 0) || !selectedRoom || !user) return;

    console.log('Sending message:', { message: newMessage, room: selectedRoom, user: user.id });

    setIsUploading(true);

    try {
      // Upload files first if any
      const uploadedFiles: { url: string; type: string; name: string }[] = [];
      
      if (selectedFiles.length > 0) {
        toast({
          title: "Uploading files...",
          description: `Uploading ${selectedFiles.length} file(s)...`,
        });

        for (const attachment of selectedFiles) {
          const url = await uploadFile(attachment.file);
          if (url) {
            uploadedFiles.push({
              url,
              type: attachment.type,
              name: attachment.file.name
            });
          } else {
            // If any file fails to upload, stop and show error
            toast({
              title: "Upload failed",
              description: `Failed to upload ${attachment.file.name}`,
              variant: "destructive"
            });
            setIsUploading(false);
            return;
          }
        }
      }

      // Create optimistic message
      const optimistic: Message = {
        id: `pending-${Date.now()}`,
        chat_room_id: selectedRoom,
        sender_id: user.id,
        message: newMessage.trim(),
        created_at: new Date().toISOString(),
        attachment_url: uploadedFiles.length > 0 ? uploadedFiles[0].url : undefined,
        attachment_type: uploadedFiles.length > 0 ? uploadedFiles[0].type : undefined,
        attachment_name: uploadedFiles.length > 0 ? uploadedFiles[0].name : undefined,
        profiles: {
          display_name: '',
          avatar_url: ''
        }
      };

      setMessages(prev => [...prev, optimistic]);
      const messageToSend = newMessage.trim();
      setNewMessage('');
      setSelectedFiles([]);

      setTimeout(() => scrollToBottom('smooth'), 50);

      // Send message to database
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_room_id: selectedRoom,
          sender_id: user.id,
          message: messageToSend,
          attachment_url: uploadedFiles.length > 0 ? uploadedFiles[0].url : null,
          attachment_type: uploadedFiles.length > 0 ? uploadedFiles[0].type : null,
          attachment_name: uploadedFiles.length > 0 ? uploadedFiles[0].name : null
        });

      if (error) {
        console.error('Database error:', error);
        toast({
          title: "Error",
          description: "Failed to save message to database",
          variant: "destructive"
        });
        setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      } else {
        console.log('Message sent successfully to database');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }, [newMessage, selectedFiles, selectedRoom, user, toast]);

  // ===== SCROLL FUNCTIONS =====
  
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      setShowScrollToBottom(!isNearBottom);
    }
  }, []);

  // ===== USE EFFECT HOOKS =====

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom('auto');
    }
  }, [messages, selectedRoom, scrollToBottom]);

  useEffect(() => {
    if (selectedRoom && messagesContainerRef.current) {
      const timer = setTimeout(() => {
        scrollToBottom('auto');
        setShowScrollToBottom(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedRoom, scrollToBottom]);

  useEffect(() => {
    if (user) {
      fetchChatRooms();
    }
  }, [user, fetchChatRooms]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasRequestId = params.has('requestId');
    if (!selectedRoom && chatRooms.length > 0 && !hasRequestId) {
      setSelectedRoom(chatRooms[0].id);
    }
  }, [chatRooms, selectedRoom, location.search]);

  useEffect(() => {
    if (!user || chatRooms.length === 0) return;
    const params = new URLSearchParams(location.search);
    const requestId = params.get('requestId');
    if (!requestId) return;

    const ensureRoom = async () => {
      const existing = chatRooms.find(r => r.request_id === requestId);
      if (existing) {
        setSelectedRoom(existing.id);
        return;
      }

      const { data: req } = await supabase
        .from('requests')
        .select('id, user_id')
        .eq('id', requestId)
        .single();

      if (!req) return;

      const buyerId = user.id;
      const sellerId = req.user_id;
      if (buyerId === sellerId) return;

      const { data: newRooms, error } = await supabase
        .from('chat_rooms')
        .insert({ request_id: requestId, buyer_id: buyerId, seller_id: sellerId })
        .select('*');

      if (!error && newRooms && newRooms[0]) {
        await fetchChatRooms();
        setSelectedRoom(newRooms[0].id);
      }
    };

    ensureRoom();
  }, [location.search, user, chatRooms, fetchChatRooms]);

  useEffect(() => {
    if (!selectedRoom) return;
    setMessages([]);
    const timer = setTimeout(() => {
      fetchMessages();
      const cleanup = subscribeToMessages();
      return cleanup;
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedRoom, fetchMessages, subscribeToMessages]);

  useEffect(() => {
    if (!user || chatRooms.length === 0) return;
    const roomIds = new Set(chatRooms.map(r => r.id));
    const channel = supabase
      .channel('messages-all')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload: any) => {
          const msg = payload.new as { chat_room_id: string; created_at: string; sender_id: string; message: string };
          if (!roomIds.has(msg.chat_room_id)) return;
          setLatestByRoom(prev => ({ ...prev, [msg.chat_room_id]: msg.created_at }));
          setLatestPreviewByRoom(prev => ({ ...prev, [msg.chat_room_id]: { text: msg.message, created_at: msg.created_at, sender_id: msg.sender_id } }));
          setUnreadCounts(prev => {
            const current = prev[msg.chat_room_id] || 0;
            if (msg.sender_id !== user?.id && selectedRoom !== msg.chat_room_id) {
              return { ...prev, [msg.chat_room_id]: current + 1 };
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, chatRooms, selectedRoom]);

  useEffect(() => {
    return () => {
      selectedFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [selectedFiles]);

  // ===== RENDER LOGIC =====

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
    <div className="chat-layout bg-background">
      <Navigation />
      
      <div className="chat-content px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          
          {/* LEFT PANEL: Chat Rooms List */}
          <Card className="lg:col-span-1 chat-panel">
            <CardHeader className="flex-shrink-0 border-b">
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Conversations</span>
              </CardTitle>
            </CardHeader>
            
            <div className="chat-scrollable">
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
                <div className="h-full overflow-y-auto chat-scrollbar">
                  <div className="space-y-1 p-1">
                    {chatRooms.map((room) => {
                      const otherUser = getOtherUser(room);
                      return (
                        <div
                          key={room.id}
                          onClick={() => { setSelectedRoom(room.id); markRoomAsRead(room.id); }}
                          className={`p-4 cursor-pointer hover:bg-muted transition-colors rounded-lg ${
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
                                {latestPreviewByRoom[room.id]?.text ?? room.requests.title}
                              </p>
                            </div>
                            {unreadCounts[room.id] > 0 && (
                              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                                {unreadCounts[room.id] > 99 ? '99+' : unreadCounts[room.id]}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* RIGHT PANEL: Chat Messages */}
          <Card className="lg:col-span-2 chat-panel">
            {selectedRoom ? (
              <>
                <CardHeader className="flex-shrink-0 border-b">
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      {(() => {
                        const room = chatRooms.find(r => r.id === selectedRoom);
                        const otherUser = room ? getOtherUser(room) : null;
                        return otherUser?.display_name || 'Chat';
                      })()}
                    </span>
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
                
                <div className="chat-panel">
                  <div 
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                    className="chat-scrollable relative"
                  >
                    <div className="p-4 space-y-4">
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
                            {/* Attachment Display */}
                            {message.attachment_url && (
                              <div className="mb-2">
                                {message.attachment_type === 'image' ? (
                                  <img 
                                    src={message.attachment_url} 
                                    alt="Attachment" 
                                    className="max-w-full rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => window.open(message.attachment_url, '_blank')}
                                  />
                                ) : (
                                  <div className="flex items-center space-x-2 p-2 bg-black/20 rounded-lg">
                                    {getFileIcon(message.attachment_type || 'other')}
                                    <span className="text-xs truncate">{message.attachment_name}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Message Text */}
                            {message.message && (
                              <p className="text-sm">{message.message}</p>
                            )}
                            
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                    
                    {showScrollToBottom && (
                      <Button
                        onClick={() => scrollToBottom('smooth')}
                        size="icon"
                        className="absolute bottom-4 right-4 h-10 w-10 rounded-full shadow-lg bg-primary hover:bg-primary/90"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </Button>
                    )}
                  </div>

                  {/* Message Input with Emoji and File Support */}
                  <div className="chat-input-container p-4">
                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                      <div className="mb-3 p-3 bg-muted/50 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Attachments ({selectedFiles.length})</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFiles([])}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-background rounded border">
                              {file.preview ? (
                                <img src={file.preview} alt="Preview" className="w-8 h-8 object-cover rounded" />
                              ) : (
                                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                                  {getFileIcon(file.type)}
                                </div>
                              )}
                              <span className="text-xs truncate flex-1">{file.file.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <form onSubmit={sendMessage} className="flex items-end space-x-2">
                      {/* Emoji Picker */}
                      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-muted-foreground hover:text-foreground"
                          >
                            <Smile className="w-5 h-5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0" align="start">
                          <div className="p-3 border-b">
                            <h4 className="font-medium">Select Emoji</h4>
                          </div>
                          <div className="p-3 max-h-60 overflow-y-auto">
                            <div className="grid grid-cols-10 gap-2">
                              {emojis.map((emoji, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  className="w-8 h-8 text-lg hover:bg-muted rounded transition-colors"
                                  onClick={() => addEmoji(emoji)}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      
                      {/* File Attachment */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:text-foreground"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Paperclip className="w-5 h-5" />
                      </Button>
                      
                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                      />
                      
                      {/* Message Input */}
                      <div className="flex-1">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="min-h-[40px] resize-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage(e);
                            }
                          }}
                        />
                      </div>
                      
                      {/* Send Button */}
                      <Button 
                        type="submit" 
                        size="icon"
                        className="h-10 w-10 bg-primary hover:bg-primary/90"
                        disabled={(!newMessage.trim() && selectedFiles.length === 0) || isUploading}
                      >
                        {isUploading ? (
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </form>
                  </div>
                </div>
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