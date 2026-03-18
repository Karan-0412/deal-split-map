// Group chat functionality for request participants
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface RequestParticipant {
  id: string;
  request_id: string;
  user_id: string;
  joined_at: string;
  status: 'active' | 'left' | 'removed';
  profiles?: {
    display_name: string;
    avatar_url: string;
  };
}

export interface GroupChatParticipant {
  id: string;
  chat_room_id: string;
  user_id: string;
  joined_at: string;
  role: 'admin' | 'member';
  profiles?: {
    display_name: string;
    avatar_url: string;
  };
}

export const useGroupChat = () => {
  const { user } = useAuth();

  // Join a request and create/join group chat
  const joinRequest = async (requestId: string) => {
    if (!user) {
      throw new Error('Please sign in to join requests. You need to be authenticated to participate in group chats.');
    }

    try {
      // 1. Get request details including people_required and product info
      const { data: request, error: requestError } = await supabase
        .from('requests')
        .select('title, user_id, people_required, product_link')
        .eq('id', requestId)
        .single();

      if (requestError || !request) {
        throw new Error('Request not found');
      }

      // Extract product name from product_link or use title
      const getProductName = (productLink: string | null, title: string) => {
        if (!productLink) return title;
        
        try {
          const url = new URL(productLink);
          const hostname = url.hostname;
          
          // Extract product name from common e-commerce sites
          if (hostname.includes('amazon')) {
            const pathParts = url.pathname.split('/');
            const productIndex = pathParts.findIndex(part => part === 'dp');
            if (productIndex !== -1 && pathParts[productIndex + 1]) {
              return `Amazon Product - ${title}`;
            }
          } else if (hostname.includes('flipkart')) {
            return `Flipkart Product - ${title}`;
          } else if (hostname.includes('myntra')) {
            return `Myntra Product - ${title}`;
          } else if (hostname.includes('nykaa')) {
            return `Nykaa Product - ${title}`;
          } else if (hostname.includes('ajio')) {
            return `Ajio Product - ${title}`;
          }
          
          // For other sites, use domain name
          const domain = hostname.replace('www.', '');
          return `${domain} Product - ${title}`;
        } catch {
          return title;
        }
      };

      const groupName = getProductName(request.product_link, request.title);

      // 2. Check if people_required > 2 to determine if we need a group chat
      const peopleRequired = request.people_required || 2;
      const needsGroupChat = peopleRequired > 2;

      if (!needsGroupChat) {
        // For requests with 2 or fewer people required, create/join direct chat
        // First check if any chat exists for this request
        const { data: existingChats } = await supabase
          .from('chat_rooms')
          .select('id, room_type, buyer_id, seller_id')
          .eq('request_id', requestId);

        if (existingChats && existingChats.length > 0) {
          // Return the first existing chat
          return existingChats[0].id;
        }

        // Create new direct chat
        const { data: newDirectChat, error: createDirectError } = await supabase
          .from('chat_rooms')
          .insert({
            request_id: requestId,
            room_type: 'direct',
            buyer_id: request.user_id,
            seller_id: user.id
          })
          .select('id')
          .single();

        if (createDirectError) {
          // If it's a duplicate key error, try to find the existing chat
          if (createDirectError.code === '23505') {
            const { data: existingChat } = await supabase
              .from('chat_rooms')
              .select('id')
              .eq('request_id', requestId)
              .single();
            
            if (existingChat) {
              return existingChat.id;
            }
          }
          throw createDirectError;
        }
        return newDirectChat.id;
      }

      // 3. For requests with people_required > 2, handle group chat logic
      // Check if group chat already exists for this request
      const { data: existingGroupChat } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('request_id', requestId)
        .eq('room_type', 'group')
        .single();

      if (existingGroupChat) {
        return existingGroupChat.id;
      }

      // Check if any chat exists for this request (might be a direct chat that needs to be converted)
      const { data: existingChats } = await supabase
        .from('chat_rooms')
        .select('id, room_type')
        .eq('request_id', requestId);

      if (existingChats && existingChats.length > 0) {
        // Convert existing direct chat to group chat
        const { error: updateError } = await supabase
          .from('chat_rooms')
          .update({
            room_type: 'group',
            room_name: groupName,
            created_by: request.user_id
          })
          .eq('id', existingChats[0].id);

        if (updateError) throw updateError;
        return existingChats[0].id;
      }

      // Create new group chat
      const { data: newChat, error: createChatError } = await supabase
        .from('chat_rooms')
        .insert({
          request_id: requestId,
          room_type: 'group',
          room_name: groupName,
          created_by: request.user_id,
          buyer_id: request.user_id, // Keep for compatibility
          seller_id: user.id // Keep for compatibility
        })
        .select('id')
        .single();

      if (createChatError) {
        // If it's a duplicate key error, try to find the existing chat
        if (createChatError.code === '23505') {
          const { data: existingChat } = await supabase
            .from('chat_rooms')
            .select('id')
            .eq('request_id', requestId)
            .single();
          
          if (existingChat) {
            return existingChat.id;
          }
        }
        throw createChatError;
      }
      return newChat.id;
    } catch (error) {
      console.error('Error joining request:', error);
      throw error;
    }
  };

  // Get participants of a request (placeholder - will be enhanced when tables are available)
  const getRequestParticipants = async (_requestId: string): Promise<RequestParticipant[]> => {
    // Placeholder implementation
    return [];
  };

  // Get group chat participants (placeholder - will be enhanced when tables are available)
  const getGroupChatParticipants = async (_chatRoomId: string): Promise<GroupChatParticipant[]> => {
    // Placeholder implementation
    return [];
  };

  // Leave a request (placeholder - will be enhanced when tables are available)
  const leaveRequest = async (_requestId: string) => {
    if (!user) throw new Error('User not authenticated');
    // Placeholder implementation
  };

  return {
    joinRequest,
    getRequestParticipants,
    getGroupChatParticipants,
    leaveRequest
  };
};
