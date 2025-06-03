
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
  description: string;
  admin_id: string;
  created_at: string;
  updated_at: string;
  members: GroupMember[];
}

export const useGroupDetail = (groupId: string) => {
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadGroup = async () => {
    if (!groupId) return;

    try {
      // Fetch group details
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      // Fetch group memberships with user profiles
      const { data: memberships, error: memberError } = await supabase
        .from('group_memberships')
        .select(`
          user_id,
          profiles:user_id (
            display_name,
            first_name,
            last_name
          )
        `)
        .eq('group_id', groupId);

      if (memberError) throw memberError;

      // Fetch admin profile
      const { data: adminProfile, error: adminError } = await supabase
        .rpc('get_user_profile', { user_uuid: groupData.admin_id });

      if (adminError) throw adminError;

      // Build members list
      const members: GroupMember[] = [];

      // Add admin
      if (adminProfile && adminProfile.length > 0) {
        const admin = adminProfile[0];
        const { data: adminUser } = await supabase.auth.admin.getUserById(groupData.admin_id);
        
        members.push({
          id: groupData.admin_id,
          name: admin.display_name || `${admin.first_name} ${admin.last_name}`.trim() || 'Admin',
          email: adminUser?.user?.email || '',
          avatar: '',
          role: 'admin'
        });
      }

      // Add regular members
      (memberships || []).forEach((membership: any) => {
        if (membership.profiles) {
          members.push({
            id: membership.user_id,
            name: membership.profiles.display_name || 
                  `${membership.profiles.first_name} ${membership.profiles.last_name}`.trim() || 
                  'Member',
            email: '', // We'll need to fetch this separately if needed
            avatar: '',
            role: 'member'
          });
        }
      });

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
      const { data: userId } = await supabase.rpc('find_user_by_email', {
        email_address: email
      });

      if (!userId) {
        toast({
          title: "User not found",
          description: "No user found with that email address.",
          variant: "destructive",
        });
        return;
      }

      // Check if user is already a member or has pending invitation
      const { data: existingMember } = await supabase
        .from('group_memberships')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      const { data: existingInvitation } = await supabase
        .from('group_invitations')
        .select('*')
        .eq('group_id', groupId)
        .eq('invited_user_id', userId)
        .eq('status', 'pending')
        .single();

      if (existingMember) {
        toast({
          title: "User already a member",
          description: "This user is already a member of the group.",
          variant: "destructive",
        });
        return;
      }

      if (existingInvitation) {
        toast({
          title: "Invitation already sent",
          description: "An invitation has already been sent to this user.",
          variant: "destructive",
        });
        return;
      }

      // Send invitation
      const { error } = await supabase
        .from('group_invitations')
        .insert({
          group_id: groupId,
          invited_by_id: user.id,
          invited_user_id: userId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${email}.`,
      });
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: "Failed to send invitation",
        description: "Could not send the invitation. Please try again.",
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
