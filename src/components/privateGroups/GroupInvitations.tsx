
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface Invitation {
  id: string;
  group_name: string;
  invited_by_name: string;
  created_at: string;
  status: string;
}

const GroupInvitations = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadInvitations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('group_invitations')
        .select(`
          id,
          status,
          created_at,
          group_id,
          invited_by_user_id
        `)
        .eq('invited_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedInvitations = await Promise.all(
        (data || []).map(async (inv: any) => {
          // Get group name
          const { data: groupData } = await supabase
            .from('private_groups')
            .select('name')
            .eq('id', inv.group_id)
            .single();

          // Get inviter profile
          const { data: inviterProfile } = await supabase
            .rpc('get_user_profile', { user_uuid: inv.invited_by_user_id });

          return {
            id: inv.id,
            group_id: inv.group_id,
            group_name: groupData?.name || 'Unknown Group',
            invited_by_name: inviterProfile?.[0]?.display_name || 'Unknown User',
            created_at: inv.created_at,
            status: inv.status
          };
        })
      );

      setInvitations(formattedInvitations);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const respondToInvitation = async (invitationId: string, accept: boolean) => {
    setResponding(invitationId);
    try {
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
        // Get invitation details to add user to group
        const { data: invitation } = await supabase
          .from('group_invitations')
          .select('group_id')
          .eq('id', invitationId)
          .single();

        if (invitation) {
          // Add user to group members
          const { error: memberError } = await supabase
            .from('group_members')
            .insert({
              group_id: invitation.group_id,
              user_id: user?.id,
              role: 'member'
            });

          if (memberError) throw memberError;
        }
      }

      toast({
        title: accept ? "Invitation accepted" : "Invitation declined",
        description: accept ? "You have joined the group!" : "Invitation declined.",
      });

      // Refresh invitations
      loadInvitations();
    } catch (error) {
      console.error('Error responding to invitation:', error);
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
                  onClick={() => respondToInvitation(invitation.id, true)}
                  disabled={responding === invitation.id}
                  size="sm"
                >
                  <Check size={16} className="mr-1" />
                  Accept
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => respondToInvitation(invitation.id, false)}
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
