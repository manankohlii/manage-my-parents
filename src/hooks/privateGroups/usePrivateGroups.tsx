
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface Group {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  memberCount?: number;
  lastActive?: string;
  unreadMessages?: number;
  newIssues?: number;
}

export const usePrivateGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadGroups = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      console.log('Loading groups for user:', user.id);
      
      // Get groups where user is creator or member
      const { data: allGroups, error } = await supabase
        .from('private_groups')
        .select('*')
        .or(`created_by.eq.${user.id},id.in.(select group_id from group_members where user_id = ${user.id})`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading groups:', error);
        throw error;
      }

      console.log('Raw groups data:', allGroups);

      if (!allGroups || allGroups.length === 0) {
        console.log('No groups found for user');
        setGroups([]);
        return;
      }

      // For each group, get member count
      const groupsWithCounts = await Promise.all(
        allGroups.map(async (group) => {
          try {
            const { count } = await supabase
              .from('group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', group.id);

            return {
              ...group,
              memberCount: (count || 0) + 1, // +1 for creator
              lastActive: group.created_at,
              unreadMessages: 0,
              newIssues: 0
            };
          } catch (memberError) {
            console.error('Error getting member count for group', group.id, memberError);
            return {
              ...group,
              memberCount: 1,
              lastActive: group.created_at,
              unreadMessages: 0,
              newIssues: 0
            };
          }
        })
      );

      console.log('Groups with counts:', groupsWithCounts);
      setGroups(groupsWithCounts);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast({
        title: "Failed to load groups",
        description: "Could not load your groups. Please try again.",
        variant: "destructive",
      });
      setGroups([]);
    }
  };

  const createGroup = async (name: string, description: string = '') => {
    if (!user) {
      console.error('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      console.log('Creating group:', { name, user_id: user.id });
      
      // Create the group
      const { data: group, error: groupError } = await supabase
        .from('private_groups')
        .insert({
          name: name.trim(),
          created_by: user.id
        })
        .select()
        .single();

      if (groupError) {
        console.error('Error creating group:', groupError);
        throw groupError;
      }

      console.log('Group created:', group);

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) {
        console.error('Error adding creator as member:', memberError);
        // Don't throw here as the group was created successfully
        console.warn('Group created but failed to add creator as member. This may cause issues.');
      } else {
        console.log('Creator added as admin member');
      }

      toast({
        title: "Group created",
        description: `Successfully created ${name}.`,
      });

      await loadGroups();
      return group.id;
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Failed to create group",
        description: "Could not create the group. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      loadGroups().finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    groups,
    loading,
    createGroup,
    refreshGroups: loadGroups
  };
};
