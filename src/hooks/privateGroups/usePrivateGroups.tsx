
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
      console.log('=== DEBUG INFO ===');
      console.log('Current user object:', user);
      console.log('User ID from auth:', user.id);
      console.log('User email:', user.email);
      
      // Test if we can query the table at all
      const { data: allGroups, error: allError } = await supabase
        .from('private_groups')
        .select('*');
      
      console.log('All groups in table (no filter):', allGroups);
      console.log('All groups error:', allError);
      
      // Now try with the user filter
      const { data: createdGroups, error: createdError } = await supabase
        .from('private_groups')
        .select('*')
        .eq('created_by', user.id);

      console.log('Groups created by current user:', createdGroups);
      console.log('Query error:', createdError);
      
      if (createdError) {
        console.error('Error loading created groups:', createdError);
        throw createdError;
      }

      // For now, just show created groups (we can add member groups later)
      const groupsWithCounts = (createdGroups || []).map(group => ({
        ...group,
        memberCount: 1, // Just creator for now
        lastActive: group.created_at,
        unreadMessages: 0,
        newIssues: 0
      }));

      console.log('Final groups with counts:', groupsWithCounts);
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
