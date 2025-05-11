
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Mock data for now - would come from Supabase in a real implementation
const mockGroups = [
  { 
    id: "1", 
    name: "Design Thinkers", 
    memberCount: 8, 
    lastActive: "2025-05-10T14:48:00", 
    description: "A group focused on design thinking methodologies and practices.",
    unreadMessages: 5,
    newIssues: 2
  },
  { 
    id: "2", 
    name: "Ed-Tech Innovation", 
    memberCount: 12, 
    lastActive: "2025-05-09T10:23:00", 
    description: "Exploring innovative approaches in educational technology.",
    unreadMessages: 0,
    newIssues: 1
  },
  { 
    id: "3", 
    name: "AI Ethics", 
    memberCount: 6, 
    lastActive: "2025-05-08T16:05:00", 
    description: "Discussing the ethical implications of artificial intelligence.",
    unreadMessages: 3,
    newIssues: 0
  }
];

interface GroupsListProps {
  onSelectGroup: (groupId: string) => void;
}

const GroupsList = ({ onSelectGroup }: GroupsListProps) => {
  const [groups, setGroups] = useState<typeof mockGroups>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading data
    const loadGroups = async () => {
      try {
        // Would fetch from Supabase in a real implementation
        setGroups(mockGroups);
      } catch (error) {
        toast({
          title: "Failed to load groups",
          description: "Could not load your groups. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadGroups();
  }, [toast, user]);

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
          <Button className="mt-4">Create Your First Group</Button>
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
                  {(group.unreadMessages > 0 || group.newIssues > 0) && (
                    <div className="flex gap-2 items-center">
                      {group.unreadMessages > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <MessageCircle size={12} />
                          {group.unreadMessages}
                        </Badge>
                      )}
                      {group.newIssues > 0 && (
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
                Active {formatDate(group.lastActive)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {group.description}
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
