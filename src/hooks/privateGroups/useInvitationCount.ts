import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useInvitationCount = () => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCount = async () => {
    if (!user?.id) {
      setCount(0);
      setLoading(false);
      return;
    }

    try {
      const { count: pendingCount, error } = await supabase
        .from('group_invitations')
        .select('*', { count: 'exact', head: true })
        .eq('invited_user_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      setCount(pendingCount || 0);
    } catch (error) {
      console.error('Error fetching invitation count:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCount();
  }, [user?.id]);

  // Subscribe to changes
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('group_invitations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_invitations',
          filter: `invited_user_id=eq.${user.id}`
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return { count, loading, refreshCount: fetchCount };
}; 