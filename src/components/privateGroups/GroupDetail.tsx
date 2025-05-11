
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, MessageCircle, FileText, User, UserPlus, Settings } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import GroupChat from "./GroupChat";
import GroupIssues from "./GroupIssues";
import GroupMembers from "./GroupMembers";

interface GroupDetailProps {
  groupId: string;
  onBack: () => void;
}

// Mock group data
const mockGroup = {
  id: "1",
  name: "Design Thinkers",
  description: "A group focused on design thinking methodologies and practices.",
  memberCount: 8,
  createdAt: "2025-04-15T10:00:00",
  members: [
    { id: "user1", name: "Sarah Johnson", email: "sarah@example.com", avatar: "", role: "admin" as const },
    { id: "user2", name: "Michael Chen", email: "michael@example.com", avatar: "", role: "member" as const },
    { id: "user3", name: "Emma Wilson", email: "emma@example.com", avatar: "", role: "member" as const },
    { id: "user4", name: "David Kim", email: "david@example.com", avatar: "", role: "member" as const }
  ]
};

const GroupDetail = ({ groupId, onBack }: GroupDetailProps) => {
  const [group, setGroup] = useState<typeof mockGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading group data
    const loadGroup = async () => {
      try {
        // Would fetch from Supabase in a real implementation
        await new Promise(resolve => setTimeout(resolve, 800));
        setGroup(mockGroup);
      } catch (error) {
        toast({
          title: "Failed to load group",
          description: "Could not load group details. Please try again.",
          variant: "destructive",
        });
        onBack(); // Go back if loading fails
      } finally {
        setLoading(false);
      }
    };
    
    loadGroup();
  }, [groupId, onBack, toast]);

  if (loading) {
    return <div className="flex justify-center items-center h-40">Loading group details...</div>;
  }

  if (!group) {
    return <div className="text-center">Group not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {group.name}
              <Badge variant="outline" className="text-xs">
                {group.memberCount} members
              </Badge>
            </h2>
            <p className="text-muted-foreground text-sm">{group.description}</p>
          </div>
        </div>
        
        <div className="flex -space-x-2">
          {group.members.slice(0, 3).map((member) => (
            <Avatar key={member.id} className="border-2 border-background w-8 h-8">
              <AvatarFallback>
                {member.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          ))}
          {group.memberCount > 3 && (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
              +{group.memberCount - 3}
            </div>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle size={16} />
            Group Chat
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <FileText size={16} />
            Issues & Solutions
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <User size={16} />
            Members
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat">
          <GroupChat groupId={groupId} />
        </TabsContent>
        
        <TabsContent value="issues">
          <GroupIssues groupId={groupId} />
        </TabsContent>
        
        <TabsContent value="members">
          <GroupMembers groupId={groupId} members={group.members} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupDetail;
