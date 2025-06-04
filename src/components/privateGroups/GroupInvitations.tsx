import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useInvitationCount } from "@/hooks/privateGroups/useInvitationCount";

interface Invitation {
  id: string;
  group_id: string;
  group_name: string;
  invited_by_name: string;
  created_at: string;
  status: string;
}

interface GroupInvitationsProps {
  onGroupJoined?: () => void;
}

const GroupInvitations = ({ onGroupJoined }: GroupInvitationsProps) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { refreshCount } = useInvitationCount();

  const loadInvitations = async () => {
    if (!user) return;

    try {
      // Get pending invitations for current user with group details
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('group_invitations')
        .select(`
          id,
          status,
          created_at,
          group_id,
          invited_by_user_id,
          private_groups (
            id,
            name
          )
        `)
        .eq('invited_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (invitationsError) throw invitationsError;

      if (!invitationsData || invitationsData.length === 0) {
        setInvitations([]);
        return;
      }

      // Get inviter profiles for all invitations
      const inviterIds = invitationsData.map(inv => inv.invited_by_user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, first_name, last_name')
        .in('id', inviterIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const formattedInvitations = invitationsData.map(inv => {
        const group = inv.private_groups;
        const inviter = profilesData?.find(p => p.id === inv.invited_by_user_id);
        
        const inviterName = inviter?.display_name || 
                           `${inviter?.first_name || ''} ${inviter?.last_name || ''}`.trim() || 
                           'Unknown User';

        return {
          id: inv.id,
          group_id: inv.group_id,
          group_name: group?.name || 'Unknown Group',
          invited_by_name: inviterName,
          created_at: inv.created_at,
          status: inv.status
        };
      });

      setInvitations(formattedInvitations);
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast({
        title: "Failed to load invitations",
        description: "Could not load invitations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const respondToInvitation = async (invitationId: string, groupId: string, accept: boolean) => {
    setResponding(invitationId);
    try {
      if (accept) {
        // First verify the group exists
        const { data: group, error: groupError } = await supabase
          .from('private_groups')
          .select('id, name')
          .eq('id', groupId)
          .maybeSingle();

        if (groupError) {
          console.error('❌ Error checking group:', groupError);
          toast({
            title: "Error",
            description: "Could not verify group. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (!group) {
          console.error('❌ Group not found:', groupId);
          toast({
            title: "Error",
            description: "This group no longer exists.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Update invitation status
      const { error: updateError } = await supabase
        .from('group_invitations')
        .update({
          status: accept ? 'accepted' : 'declined',
          responded_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (updateError) throw updateError;

      if (accept) {
        // Add user to group members
        const { error: memberError } = await supabase
          .from('group_members')
          .insert({
            group_id: groupId,
            user_id: user?.id,
            role: 'member'
          });

        if (memberError) throw memberError;
        
        // Wait a moment to ensure database operations are complete
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verify the membership was added
        let verified = false;
        for (let i = 0; i < 3; i++) {
          try {
            const { data: verifyMembership, error: verifyError } = await supabase
              .from('group_members')
              .select('*')
              .eq('group_id', groupId)
              .eq('user_id', user?.id)
              .maybeSingle();

            if (verifyError) continue;

            if (verifyMembership) {
              verified = true;
              break;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (verifyError) {
            continue;
          }
        }

        if (!verified) {
          console.warn('⚠️ Could not verify membership after multiple attempts, but continuing...');
        }
        
        onGroupJoined?.();

        toast({
          title: "Invitation accepted",
          description: "You have joined the group!",
        });
      } else {
        toast({
          title: "Invitation declined",
          description: "Invitation declined.",
        });
      }

      // Refresh invitations and count
      await loadInvitations();
      await refreshCount();
    } catch (error) {
      console.error('❌ Error responding to invitation:', error);
      toast({
        title: "Error",
        description: "Could not respond to invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResponding(null);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, [user]);

  if (loading) {
    return <div>Loading invitations...</div>;
  }

  if (invitations.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardContent className="pt-6">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No Pending Invitations</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You don't have any pending group invitations at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <Card key={invitation.id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Group Invitation</span>
              <Badge variant="outline">Pending</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p>
                <strong>{invitation.invited_by_name}</strong> invited you to join{" "}
                <strong>"{invitation.group_name}"</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Sent {new Date(invitation.created_at).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => respondToInvitation(invitation.id, invitation.group_id, true)}
                  disabled={responding === invitation.id}
                  size="sm"
                >
                  <Check size={16} className="mr-1" />
                  Accept
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => respondToInvitation(invitation.id, invitation.group_id, false)}
                  disabled={responding === invitation.id}
                  size="sm"
                >
                  <X size={16} className="mr-1" />
                  Decline
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GroupInvitations;
