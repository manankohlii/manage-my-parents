import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "member";
}

export interface GroupDetail {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  members: GroupMember[];
}

export const useGroupDetail = (groupId: string) => {
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadGroup = async () => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch group details
      const { data: groupData, error: groupError } = await supabase
        .from('private_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) {
        console.error('Error loading group:', groupError);
        throw groupError;
      }

      console.log('Group data loaded:', groupData);

      // Fetch group memberships
      const { data: memberships, error: memberError } = await supabase
        .from('group_members')
        .select('user_id, role')
        .eq('group_id', groupId);

      if (memberError) {
        console.error('Error loading memberships:', memberError);
        // Continue without throwing - we can still show the group
      }

      console.log('Memberships loaded:', memberships);

      // Build members list
      const members: GroupMember[] = [];

      // Add creator as admin - use profiles table directly
      try {
        const { data: creatorProfile } = await supabase
          .from('profiles')
          .select('display_name, first_name, last_name')
          .eq('id', groupData.created_by)
          .single();

        console.log('Creator profile:', creatorProfile);

        if (creatorProfile) {
          members.push({
            id: groupData.created_by,
            name: creatorProfile.display_name || 
                  `${creatorProfile.first_name || ''} ${creatorProfile.last_name || ''}`.trim() || 
                  'Admin',
            email: '',
            avatar: '',
            role: 'admin'
          });
        } else {
          // Fallback if profile not found
          members.push({
            id: groupData.created_by,
            name: 'Admin',
            email: '',
            avatar: '',
            role: 'admin'
          });
        }
      } catch (profileError) {
        console.error('Error loading creator profile:', profileError);
        // Add fallback member
        members.push({
          id: groupData.created_by,
          name: 'Admin',
          email: '',
          avatar: '',
          role: 'admin'
        });
      }

      // Add regular members - use profiles table directly
      if (memberships && memberships.length > 0) {
        for (const membership of memberships) {
          // Skip if it's the creator (already added)
          if (membership.user_id === groupData.created_by) continue;

          try {
            const { data: memberProfile } = await supabase
              .from('profiles')
              .select('display_name, first_name, last_name')
              .eq('id', membership.user_id)
              .single();

            if (memberProfile) {
              members.push({
                id: membership.user_id,
                name: memberProfile.display_name || 
                      `${memberProfile.first_name || ''} ${memberProfile.last_name || ''}`.trim() || 
                      'Member',
                email: '',
                avatar: '',
                role: membership.role as 'admin' | 'member'
              });
            } else {
              // Fallback if profile not found
              members.push({
                id: membership.user_id,
                name: 'Member',
                email: '',
                avatar: '',
                role: membership.role as 'admin' | 'member'
              });
            }
          } catch (memberProfileError) {
            console.error('Error loading member profile:', memberProfileError);
            // Add fallback member
            members.push({
              id: membership.user_id,
              name: 'Member',
              email: '',
              avatar: '',
              role: membership.role as 'admin' | 'member'
            });
          }
        }
      }

      console.log('Final members list:', members);

      setGroup({
        ...groupData,
        members
      });
    } catch (error) {
      console.error('Error loading group:', error);
      toast({
        title: "Failed to load group",
        description: "Could not load group details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async (email: string) => {
    if (!user || !groupId) return;

    try {
      // Find user by email
      const { data: userId, error: findError } = await supabase.rpc('find_user_by_email', {
        email_address: email
      });

      if (findError) {
        console.error('Error finding user:', findError);
        throw findError;
      }

      if (!userId) {
        toast({
          title: "User not found",
          description: "No user found with that email address.",
          variant: "destructive",
        });
        return;
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingMember) {
        toast({
          title: "User already a member",
          description: "This user is already a member of the group.",
          variant: "destructive",
        });
        return;
      }

      // Add user to group
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member'
        });

      if (error) {
        console.error('Error adding member:', error);
        throw error;
      }

      toast({
        title: "Member added",
        description: `${email} has been added to the group.`,
      });

      await loadGroup();
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: "Failed to add member",
        description: "Could not add the member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeMember = async (memberId: string) => {
    if (!user || !groupId) return;

    try {
      // Check if current user is admin
      const { data: groupData, error: groupError } = await supabase
        .from('private_groups')
        .select('created_by')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      if (groupData.created_by !== user.id) {
        toast({
          title: "Permission denied",
          description: "Only group admins can remove members.",
          variant: "destructive",
        });
        return;
      }

      // Check if trying to remove the admin
      if (memberId === groupData.created_by) {
        toast({
          title: "Cannot remove admin",
          description: "You cannot remove the group admin.",
          variant: "destructive",
        });
        return;
      }

      // Remove member from group
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', memberId);

      if (error) throw error;

      toast({
        title: "Member removed",
        description: "The member has been removed from the group.",
      });

      await loadGroup();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Failed to remove member",
        description: "Could not remove the member. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  return {
    group,
    loading,
    inviteMember,
    removeMember,
    refreshGroup: loadGroup
  };
};
