
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
    if (!user) return;
    
    try {
      console.log('Loading groups for user:', user.id);
      
      // Get groups where user is creator
      const { data: createdGroups, error: createdError } = await supabase
        .from('private_groups')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (createdError) {
        console.error('Error loading created groups:', createdError);
        throw createdError;
      }

      // Get groups where user is member
      const { data: memberGroups, error: memberError } = await supabase
        .from('group_members')
        .select(`
          group_id,
          private_groups (*)
        `)
        .eq('user_id', user.id);

      if (memberError) {
        console.error('Error loading member groups:', memberError);
        throw memberError;
      }

      // Combine both lists and remove duplicates
      const allGroups = [...(createdGroups || [])];
      
      // Add member groups that aren't already in the created groups list
      if (memberGroups) {
        memberGroups.forEach((membership: any) => {
          if (membership.private_groups && !allGroups.find(g => g.id === membership.private_groups.id)) {
            allGroups.push(membership.private_groups);
          }
        });
      }

      // For each group, get member count
      const groupsWithCounts = await Promise.all(
        allGroups.map(async (group) => {
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          return {
            ...group,
            memberCount: (count || 0) + 1, // +1 for creator
            lastActive: group.created_at,
            unreadMessages: 0, // Will be implemented with real-time
            newIssues: 0 // Will be implemented when issues are connected to groups
          };
        })
      );

      console.log('Loaded groups:', groupsWithCounts);
      setGroups(groupsWithCounts);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast({
        title: "Failed to load groups",
        description: "Could not load your groups. Please try again.",
        variant: "destructive",
      });
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
        throw memberError;
      }

      console.log('Creator added as admin member');

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
