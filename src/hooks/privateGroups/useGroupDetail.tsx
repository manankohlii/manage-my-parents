
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

      // Add creator as admin
      try {
        const { data: creatorProfile } = await supabase
          .rpc('get_user_profile', { user_uuid: groupData.created_by });

        console.log('Creator profile:', creatorProfile);

        if (creatorProfile && creatorProfile.length > 0) {
          const creator = creatorProfile[0];
          members.push({
            id: groupData.created_by,
            name: creator.display_name || 
                  `${creator.first_name || ''} ${creator.last_name || ''}`.trim() || 
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

      // Add regular members
      if (memberships && memberships.length > 0) {
        for (const membership of memberships) {
          // Skip if it's the creator (already added)
          if (membership.user_id === groupData.created_by) continue;

          try {
            const { data: userProfile } = await supabase
              .rpc('get_user_profile', { user_uuid: membership.user_id });

            if (userProfile && userProfile.length > 0) {
              const profile = userProfile[0];
              members.push({
                id: membership.user_id,
                name: profile.display_name || 
                      `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 
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

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  return {
    group,
    loading,
    inviteMember,
    refreshGroup: loadGroup
  };
};
