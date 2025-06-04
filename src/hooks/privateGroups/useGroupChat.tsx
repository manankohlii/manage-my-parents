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
    if (!groupId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        throw error;
      }

      console.log('Raw messages:', data);

      // Get unique user IDs from messages
      const userIds = [...new Set((data || []).map(msg => msg.user_id))];
      console.log('Unique user IDs:', userIds);

      // Fetch all user profiles at once
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, first_name, last_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        throw profilesError;
      }

      console.log('User profiles:', profiles);

      // Enhance messages with user names
      const enhancedMessages = (data || []).map(message => {
        const profile = profiles?.find(p => p.id === message.user_id);
        const userName = profile?.display_name || 
                        `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 
                        'Unknown User';

        return {
          ...message,
          userName
        };
      });

      console.log('Enhanced messages:', enhancedMessages);
      setMessages(enhancedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Failed to load messages",
        description: "Could not load chat messages. Please try again.",
        variant: "destructive",
      });
      setMessages([]);
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

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

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
        (payload) => {
          console.log('New message received via real-time:', payload);
          // Reload messages to get the enhanced version with user names
          loadMessages();
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Unsubscribing from real-time channel');
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
