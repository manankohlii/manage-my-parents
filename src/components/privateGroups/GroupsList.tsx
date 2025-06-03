
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { usePrivateGroups } from "@/hooks/privateGroups/usePrivateGroups";

interface GroupsListProps {
  onSelectGroup: (groupId: string) => void;
}

const GroupsList = ({ onSelectGroup }: GroupsListProps) => {
  const { groups, loading, refreshGroups } = usePrivateGroups();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      refreshGroups();
    }
  }, [user, refreshGroups]);

  // Function to format date display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full">
            <CardHeader>
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardContent className="pt-6">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No Groups Yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You haven't joined any private groups yet.
          </p>
          <Button className="mt-4" onClick={() => {}}>Create Your First Group</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <Card key={group.id} className="w-full hover:bg-muted/50 transition-colors">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {group.name}
                  {((group.unreadMessages || 0) > 0 || (group.newIssues || 0) > 0) && (
                    <div className="flex gap-2 items-center">
                      {(group.unreadMessages || 0) > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <MessageCircle size={12} />
                          {group.unreadMessages}
                        </Badge>
                      )}
                      {(group.newIssues || 0) > 0 && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <FileText size={12} />
                          {group.newIssues}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {group.memberCount} members
                  </span>
                </CardDescription>
              </div>
              <span className="text-xs text-muted-foreground">
                Active {formatDate(group.lastActive || group.updated_at)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {group.description || "No description provided."}
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => onSelectGroup(group.id)}>
              View Group
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default GroupsList;
