
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface Group {
  id: string;
  name: string;
  description: string;
  admin_id: string;
  created_at: string;
  updated_at: string;
  memberCount?: number;
  lastActive?: string;
  unreadMessages?: number;
  newIssues?: number;
}

export interface GroupInvitation {
  id: string;
  group_id: string;
  invited_by_id: string;
  invited_user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  group?: {
    name: string;
  };
  inviter?: {
    display_name: string;
    first_name: string;
    last_name: string;
  };
}

export const usePrivateGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadGroups = async () => {
    if (!user) return;
    
    try {
      // Fetch groups where user is admin or member
      const { data: groupsData, error } = await supabase
        .from('groups')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // For each group, get member count
      const groupsWithCounts = await Promise.all(
        (groupsData || []).map(async (group) => {
          const { count } = await supabase
            .from('group_memberships')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          return {
            ...group,
            memberCount: (count || 0) + 1, // +1 for admin
            lastActive: group.updated_at,
            unreadMessages: 0, // Will be implemented with real-time
            newIssues: 0 // Will be implemented when issues are connected to groups
          };
        })
      );

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

  const loadInvitations = async () => {
    if (!user) return;

    try {
      // First get the invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('group_invitations')
        .select(`
          id,
          group_id,
          invited_by_id,
          invited_user_id,
          status,
          created_at,
          updated_at
        `)
        .eq('invited_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (invitationsError) throw invitationsError;

      // Then enhance each invitation with group and inviter data
      const enhancedInvitations = await Promise.all(
        (invitationsData || []).map(async (invitation) => {
          // Get group name
          const { data: groupData } = await supabase
            .from('groups')
            .select('name')
            .eq('id', invitation.group_id)
            .single();

          // Get inviter profile
          const { data: inviterProfile } = await supabase
            .rpc('get_user_profile', { user_uuid: invitation.invited_by_id });

          const enhancedInvitation: GroupInvitation = {
            ...invitation,
            status: invitation.status as 'pending' | 'accepted' | 'rejected',
            group: groupData ? { name: groupData.name } : undefined,
            inviter: inviterProfile && inviterProfile.length > 0 ? {
              display_name: inviterProfile[0].display_name,
              first_name: inviterProfile[0].first_name,
              last_name: inviterProfile[0].last_name
            } : undefined
          };

          return enhancedInvitation;
        })
      );

      setInvitations(enhancedInvitations);
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast({
        title: "Failed to load invitations",
        description: "Could not load your invitations. Please try again.",
        variant: "destructive",
      });
    }
  };

  const createGroup = async (name: string, description: string, inviteEmails: string[] = []) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Create the group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: name.trim(),
          description: description.trim(),
          admin_id: user.id
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Send invitations if any emails provided
      if (inviteEmails.length > 0) {
        await Promise.all(
          inviteEmails.map(async (email) => {
            const { data: userId } = await supabase.rpc('find_user_by_email', {
              email_address: email
            });

            if (userId) {
              await supabase
                .from('group_invitations')
                .insert({
                  group_id: group.id,
                  invited_by_id: user.id,
                  invited_user_id: userId,
                  status: 'pending'
                });
            }
          })
        );
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

  const acceptInvitation = async (invitationId: string) => {
    try {
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (!invitation) throw new Error('Invitation not found');

      // Update invitation status
      const { error: updateError } = await supabase
        .from('group_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId);

      if (updateError) throw updateError;

      // Add user to group memberships
      const { error: memberError } = await supabase
        .from('group_memberships')
        .insert({
          group_id: invitation.group_id,
          user_id: invitation.invited_user_id
        });

      if (memberError) throw memberError;

      toast({
        title: "Invitation accepted",
        description: "You have successfully joined the group.",
      });

      await Promise.all([loadGroups(), loadInvitations()]);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Failed to accept invitation",
        description: "Could not accept the invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const rejectInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('group_invitations')
        .update({ status: 'rejected' })
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Invitation rejected",
        description: "The invitation has been declined.",
      });

      await loadInvitations();
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      toast({
        title: "Failed to reject invitation",
        description: "Could not reject the invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      Promise.all([loadGroups(), loadInvitations()]).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    groups,
    invitations,
    loading,
    createGroup,
    acceptInvitation,
    rejectInvitation,
    refreshGroups: loadGroups,
    refreshInvitations: loadInvitations
  };
};
