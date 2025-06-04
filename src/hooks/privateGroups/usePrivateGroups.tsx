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
  isOwner?: boolean;
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
    
    let createdGroups = null;
    
    try {
      console.log('🔄 Starting to load groups for user:', user.id);
      console.log('=== Loading groups for user ===');
      console.log('User ID:', user.id);
      
      // Get groups created by user
      const { data: createdGroupsData, error: createdError } = await supabase
        .from('private_groups')
        .select('*')
        .eq('created_by', user.id);

      if (createdError) {
        console.error('❌ Error loading created groups:', createdError);
        throw createdError;
      }

      createdGroups = createdGroupsData;
      console.log('✅ Created groups:', createdGroups);

      // Get groups where user is a member - simple separate queries
      const { data: membershipData, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (memberError) {
        console.error('❌ Error loading memberships:', memberError);
        throw memberError;
      }

      console.log('✅ Memberships data:', membershipData);

      let memberGroups = [];
      if (membershipData && membershipData.length > 0) {
        const groupIds = membershipData.map(m => m.group_id);
        console.log('📋 Group IDs from memberships:', groupIds);
        
        const { data: memberGroupData, error: memberGroupError } = await supabase
          .from('private_groups')
          .select('*')
          .in('id', groupIds);

        if (memberGroupError) {
          console.error('❌ Error loading member group details:', memberGroupError);
          throw memberGroupError;
        }

        memberGroups = memberGroupData || [];
        console.log('✅ Member groups data:', memberGroups);
      }

      // Combine and deduplicate groups (in case user is both creator and member)
      const allGroups = [
        ...(createdGroups || []).map(group => ({ ...group, isOwner: true })),
        ...memberGroups
          .filter(memberGroup => 
            !createdGroups?.some(createdGroup => createdGroup.id === memberGroup.id)
          )
          .map(group => ({ ...group, isOwner: false }))
      ];

      console.log('📊 Final combined groups before processing:', allGroups);
      console.log('All groups combined:', allGroups);

      // Add member counts for each group - only count group_members table
      const groupsWithCounts = await Promise.all(
        allGroups.map(async (group) => {
          try {
            const { count, error } = await supabase
              .from('group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', group.id);

            if (error) {
              console.error('⚠️ Error counting members for group:', group.id, error);
            }

            console.log(`👥 Group ${group.name} has ${count || 0} members`);

            return {
              ...group,
              memberCount: count || 0,
              lastActive: group.created_at,
              unreadMessages: 0,
              newIssues: 0
            };
          } catch (error) {
            console.error('❌ Error processing group:', group.id, error);
            return {
              ...group,
              memberCount: 0,
              lastActive: group.created_at,
              unreadMessages: 0,
              newIssues: 0
            };
          }
        })
      );

      console.log('✅ Setting groups state with:', groupsWithCounts);
      console.log('Final groups with counts:', groupsWithCounts);
      setGroups(groupsWithCounts);
    } catch (error) {
      console.error('❌ DETAILED ERROR in loadGroups:', {
        error,
        errorMessage: error.message,
        userId: user.id,
        timestamp: new Date().toISOString()
      });
      
      // Try to show partial data if possible
      if (createdGroups) {
        console.log('⚠️ Showing only created groups due to error');
        setGroups((createdGroups || []).map(group => ({ 
          ...group, 
          isOwner: true, 
          memberCount: 1 
        })));
      }
      
      toast({
        title: "Partial failure loading groups",
        description: `Loaded ${createdGroups?.length || 0} created groups, but failed to load member groups. Check console for details.`,
        variant: "destructive",
      });
      
      if (!createdGroups) {
        setGroups([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const debugGroups = async () => {
    if (!user) return;
    
    console.log('🐛 DEBUG: Checking groups for user:', user.id);
    
    // Check memberships
    const { data: memberships } = await supabase
      .from('group_members')
      .select('*')
      .eq('user_id', user.id);
    
    console.log('🐛 DEBUG: Raw memberships:', memberships);
    
    // Check created groups
    const { data: created } = await supabase
      .from('private_groups')
      .select('*')
      .eq('created_by', user.id);
      
    console.log('🐛 DEBUG: Created groups:', created);
    
    // Check accepted invitations
    const { data: invitations } = await supabase
      .from('group_invitations')
      .select('*')
      .eq('invited_user_id', user.id)
      .eq('status', 'accepted');
      
    console.log('🐛 DEBUG: Accepted invitations:', invitations);
    
    // Force reload
    await loadGroups();
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
  }, [user?.id]);

  return {
    groups,
    loading,
    createGroup,
    refreshGroups: loadGroups,
    debugGroups
  };
};
