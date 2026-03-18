// Smart chat navigation utility
import { supabase } from '@/integrations/supabase/client';

export const navigateToSmartChat = async (requestId: string, navigate: (path: string) => void) => {
  try {
    // OPTIMIZATION: Get current user first (cached by Supabase)
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      navigate('/chat');
      return;
    }

    // OPTIMIZATION: Single query to get request and check for existing chat
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select('user_id')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      navigate('/chat');
      return;
    }

    // OPTIMIZATION: Single query to check for existing direct chat (both combinations)
    const { data: existingChat, error: chatError } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('room_type', 'direct')
      .or(`and(buyer_id.eq.${request.user_id},seller_id.eq.${currentUser.id}),and(buyer_id.eq.${currentUser.id},seller_id.eq.${request.user_id})`)
      .single();

    if (existingChat && !chatError) {
      // Found existing chat - navigate immediately
      navigate(`/chat?roomId=${existingChat.id}`);
      return;
    }

    // No existing chat - navigate to create new one
    navigate(`/chat?requestId=${requestId}`);
    
  } catch (error) {
    // Silent fallback - no console logging for performance
    navigate('/chat');
  }
};
