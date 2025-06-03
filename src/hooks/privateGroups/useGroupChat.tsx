
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface ChatMessage {
  id: string;
  message: string;
  user_id: string;
  group_id: string;
  created_at: string;
  userName?: string;
}

export const useGroupChat = (groupId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadMessages = useCallback(async () => {
    if (!groupId) return;

    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Enhance messages with user names
      const enhancedMessages = await Promise.all(
        (data || []).map(async (message) => {
          const { data: userProfile } = await supabase
            .rpc('get_user_profile', { user_uuid: message.user_id });
          
          let userName = 'Unknown User';
          if (userProfile && userProfile.length > 0) {
            const profile = userProfile[0];
            userName = profile.display_name || 
                     `${profile.first_name} ${profile.last_name}`.trim() || 
                     'User';
          }

          return {
            ...message,
            userName
          };
        })
      );

      setMessages(enhancedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Failed to load messages",
        description: "Could not load chat messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [groupId, toast]);

  const sendMessage = async (messageText: string) => {
    if (!user || !groupId || !messageText.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          user_id: user.id,
          message: messageText.trim()
        });

      if (error) throw error;

      // Reload messages to get the new one
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "Your message could not be sent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel(`group-messages-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`
        },
        () => {
          // Reload messages when new message is inserted
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, loadMessages]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return {
    messages,
    loading,
    sending,
    sendMessage
  };
};
