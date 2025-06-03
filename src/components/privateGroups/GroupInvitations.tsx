
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrivateGroups } from "@/hooks/privateGroups/usePrivateGroups";

const GroupInvitations = () => {
  const { invitations, loading, acceptInvitation, rejectInvitation, refreshInvitations } = usePrivateGroups();

  useEffect(() => {
    refreshInvitations();
  }, [refreshInvitations]);

  // Format date display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="w-full">
            <CardHeader>
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardFooter>
              <div className="flex gap-2 w-full">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardContent className="pt-6">
          <User className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No Pending Invitations</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You don't have any group invitations at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <Card key={invitation.id} className="w-full">
          <CardHeader>
            <CardTitle>{invitation.group?.name || 'Unknown Group'}</CardTitle>
            <CardDescription>
              Invited by {invitation.inviter?.display_name || 
                         `${invitation.inviter?.first_name} ${invitation.inviter?.last_name}`.trim() || 
                         'Unknown User'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <div>
                <span className="text-muted-foreground">
                  Invitation pending
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Invited on {formatDate(invitation.created_at)}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex gap-3 w-full">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => rejectInvitation(invitation.id)}
              >
                <X size={16} className="mr-2" />
                Decline
              </Button>
              <Button 
                className="w-full" 
                onClick={() => acceptInvitation(invitation.id)}
              >
                <Check size={16} className="mr-2" />
                Accept
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default GroupInvitations;
