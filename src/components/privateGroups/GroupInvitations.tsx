
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Check, X, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data for invitations
const mockInvitations = [
  {
    id: "inv1",
    groupId: "1",
    groupName: "Design Thinkers",
    inviterName: "Sarah Johnson",
    inviterEmail: "sarah@example.com",
    timestamp: "2025-05-10T12:30:00",
    memberCount: 8
  },
  {
    id: "inv2",
    groupId: "4",
    groupName: "Future Tech Education",
    inviterName: "Michael Chen",
    inviterEmail: "michael@example.com",
    timestamp: "2025-05-09T15:45:00",
    memberCount: 5
  }
];

const GroupInvitations = () => {
  const [invitations, setInvitations] = useState<typeof mockInvitations>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading invitations data
    const loadInvitations = async () => {
      try {
        // Would fetch from Supabase in a real implementation
        await new Promise(resolve => setTimeout(resolve, 800));
        setInvitations(mockInvitations);
      } catch (error) {
        toast({
          title: "Failed to load invitations",
          description: "Could not load your invitations. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadInvitations();
  }, [toast]);

  const handleAcceptInvitation = async (invitationId: string) => {
    setProcessingId(invitationId);
    try {
      // Simulate API call - would update in Supabase in a real implementation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Remove invitation from list
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      
      toast({
        title: "Invitation accepted",
        description: "You have successfully joined the group.",
      });
    } catch (error) {
      toast({
        title: "Failed to accept invitation",
        description: "Could not accept the invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    setProcessingId(invitationId);
    try {
      // Simulate API call - would update in Supabase in a real implementation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Remove invitation from list
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      
      toast({
        title: "Invitation rejected",
        description: "The invitation has been declined.",
      });
    } catch (error) {
      toast({
        title: "Failed to reject invitation",
        description: "Could not reject the invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

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
            <CardTitle>{invitation.groupName}</CardTitle>
            <CardDescription>
              Invited by {invitation.inviterName} ({invitation.inviterEmail})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <div>
                <span className="text-muted-foreground">
                  {invitation.memberCount} members
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Invited on {formatDate(invitation.timestamp)}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex gap-3 w-full">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => handleRejectInvitation(invitation.id)}
                disabled={processingId === invitation.id}
              >
                <X size={16} className="mr-2" />
                Decline
              </Button>
              <Button 
                className="w-full" 
                onClick={() => handleAcceptInvitation(invitation.id)}
                disabled={processingId === invitation.id}
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
