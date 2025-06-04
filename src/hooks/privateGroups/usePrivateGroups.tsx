import { useState, useEffect, useCallback } from "react";
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

  const cleanupOrphanedMemberships = async () => {
    if (!user) return;
    
    console.log('🧹 Auto-cleanup: Checking for orphaned memberships...');
    
    try {
      // Get all user's memberships
      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id, id')
        .eq('user_id', user.id);
      
      if (!memberships || memberships.length === 0) {
        console.log('✅ No memberships to check');
        return;
      }
      
      // Check which groups actually exist
      const groupIds = memberships.map(m => m.group_id);
      const { data: existingGroups } = await supabase
        .from('private_groups')
        .select('id')
        .in('id', groupIds);
      
      const existingGroupIds = existingGroups?.map(g => g.id) || [];
      const orphanedMemberships = memberships.filter(m => !existingGroupIds.includes(m.group_id));
      
      if (orphanedMemberships.length > 0) {
        console.log(`🗑️ Auto-cleanup: Removing ${orphanedMemberships.length} orphaned memberships`);
        
        const orphanedIds = orphanedMemberships.map(m => m.id);
        await supabase
          .from('group_members')
          .delete()
          .in('id', orphanedIds);
          
        console.log('✅ Auto-cleanup: Orphaned memberships cleaned up');
      } else {
        console.log('✅ Auto-cleanup: No orphaned memberships found');
      }
    } catch (error) {
      console.error('❌ Auto-cleanup failed:', error);
    }
  };

  const loadGroups = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    console.log('🔄 Starting to load groups for user:', user.id);
    setLoading(true);
    
    let createdGroups = null;
    
    try {
      // Run cleanup first
      await cleanupOrphanedMemberships();
      
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

      // Get groups where user is a member
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
        
        // Log missing groups (orphaned memberships)
        const foundGroupIds = memberGroups.map(g => g.id);
        const missingGroupIds = groupIds.filter(id => !foundGroupIds.includes(id));
        if (missingGroupIds.length > 0) {
          console.warn('⚠️ Found orphaned memberships for deleted groups:', missingGroupIds);
        }
      }

      // Combine and deduplicate groups
      const allGroups = [
        ...(createdGroups || []).map(group => ({ ...group, isOwner: true })),
        ...memberGroups
          .filter(memberGroup => 
            !createdGroups?.some(createdGroup => createdGroup.id === memberGroup.id)
          )
          .map(group => ({ ...group, isOwner: false }))
      ];

      console.log('📊 Final combined groups:', allGroups);

      // Add member counts for each group
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
      setGroups(groupsWithCounts);
      
    } catch (error) {
      console.error('❌ Error loading groups:', error);
      
      // Try to show partial data if possible
      if (createdGroups) {
        console.log('⚠️ Showing only created groups due to error');
        setGroups((createdGroups || []).map(group => ({ 
          ...group, 
          isOwner: true, 
          memberCount: 1 
        })));
        
        toast({
          title: "Partial failure loading groups",
          description: `Loaded ${createdGroups.length} created groups, but failed to load member groups.`,
          variant: "destructive",
        });
      } else {
        setGroups([]);
        toast({
          title: "Failed to load groups",
          description: "Could not load your groups. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

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

  const deleteGroup = async (groupId: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('🗑️ Attempting to delete group:', groupId);
      
      // Check if user is admin of this group
      const { data: group, error: groupError } = await supabase
        .from('private_groups')
        .select('created_by')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      if (group.created_by !== user.id) {
        throw new Error('Only group admins can delete groups');
      }

      // Delete in correct order to avoid foreign key constraints
      console.log('🗑️ Deleting group messages...');
      await supabase
        .from('group_messages')
        .delete()
        .eq('group_id', groupId);

      console.log('🗑️ Deleting group invitations...');
      await supabase
        .from('group_invitations')
        .delete()
        .eq('group_id', groupId);

      console.log('🗑️ Deleting group members...');
      await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId);

      console.log('🗑️ Deleting group...');
      const { error: deleteError } = await supabase
        .from('private_groups')
        .delete()
        .eq('id', groupId);

      if (deleteError) throw deleteError;

      toast({
        title: "Group deleted",
        description: "The group has been permanently deleted.",
      });

      console.log('✅ Group successfully deleted:', groupId);
      
      // Refresh groups list
      await loadGroups();
      
    } catch (error) {
      console.error('❌ Error deleting group:', error);
      toast({
        title: "Failed to delete group",
        description: error.message || "Could not delete the group. Please try again.",
        variant: "destructive",
      });
      throw error;
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

  // Simple useEffect that only runs when user changes
  useEffect(() => {
    if (user?.id) {
      console.log('🚀 User detected, loading groups...');
      loadGroups();
    } else {
      console.log('❌ No user, setting loading false');
      setLoading(false);
      setGroups([]);
    }
  }, [user?.id, loadGroups]);

  return {
    groups,
    loading,
    createGroup,
    refreshGroups: loadGroups,
    deleteGroup,
    debugGroups
  };
};
