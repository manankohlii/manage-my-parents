
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
      
      // Method 1: Get groups created by user
      const { data: createdGroups, error: createdError } = await supabase
        .from('private_groups')
        .select('*')
        .eq('created_by', user.id);

      if (createdError) {
        console.error('Error loading created groups:', createdError);
        throw createdError;
      }

      // Method 2: Get group IDs where user is a member (simple query)
      const { data: memberships, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (memberError) {
        console.error('Error loading memberships:', memberError);
        console.warn('Could not load member groups, showing only created groups');
      }

      // Method 3: Get the actual group data for member groups
      let memberGroups = [];
      if (memberships && memberships.length > 0) {
        const groupIds = memberships.map(m => m.group_id);
        
        const { data: memberGroupData, error: groupDataError } = await supabase
          .from('private_groups')
          .select('*')
          .in('id', groupIds);

        if (groupDataError) {
          console.error('Error loading member group data:', groupDataError);
        } else {
          memberGroups = memberGroupData || [];
        }
      }

      // Combine groups from both sources
      const allGroups = [...(createdGroups || []), ...memberGroups];

      // Remove duplicates based on group id
      const uniqueGroups = allGroups.filter((group, index, self) => 
        index === self.findIndex(g => g?.id === group?.id)
      );

      console.log('All unique groups:', uniqueGroups);

      if (!uniqueGroups || uniqueGroups.length === 0) {
        console.log('No groups found for user');
        setGroups([]);
        return;
      }

      // For each group, get member count
      const groupsWithCounts = await Promise.all(
        uniqueGroups.map(async (group) => {
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
    } finally {
      setLoading(false);
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

      // Add creator as admin member (optional step)
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
      }

      toast({
        title: "Group created",
        description: `Successfully created ${name}.`,
      });

      // Refresh groups list
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
    if (user?.id) {
      loadGroups();
    } else {
      setLoading(false);
    }
  }, [user?.id]); // Only depend on user.id, not the whole user object

  return {
    groups,
    loading,
    createGroup,
    refreshGroups: loadGroups
  };
};
