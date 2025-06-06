import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, FileText, User } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import GroupChat from "./GroupChat";
import GroupIssues from "./GroupIssues";
import GroupMembers from "./GroupMembers";
import { useGroupDetail } from "@/hooks/privateGroups/useGroupDetail";
import { usePrivateGroups } from "@/hooks/privateGroups/usePrivateGroups";
import { useAuth } from "@/contexts/AuthContext";

interface GroupDetailProps {
  groupId: string;
  onBack: () => void;
}

const GroupDetail = ({ groupId, onBack }: GroupDetailProps) => {
  const { group, loading } = useGroupDetail(groupId);
  const { deleteGroup } = usePrivateGroups();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("chat");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteGroup = async () => {
    if (!group) return;
    
    try {
      await deleteGroup(group.id);
      onBack(); // Go back to groups list after deletion
    } catch (error) {
      // Error handling is done in the hook
    }
    setShowDeleteConfirm(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-40">Loading group details...</div>;
  }

  if (!group) {
    return <div className="text-center">Group not found</div>;
  }

  // Check if current user is admin
  const isAdmin = group && user && group.created_by === user.id;

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
                {group.members.length} members
              </Badge>
            </h2>
            <p className="text-muted-foreground text-sm">Private group for collaboration</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Member avatars */}
          <div className="flex -space-x-2">
            {group.members.slice(0, 3).map((member) => (
              <Avatar key={member.id} className="border-2 border-background w-8 h-8">
                <AvatarFallback>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
            {group.members.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                +{group.members.length - 3}
              </div>
            )}
          </div>
          
          {/* Delete button for admins */}
          {isAdmin && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Group
            </Button>
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
            Challenges & Solutions
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

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Group</h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete "{group.name}"? This action cannot be undone and will permanently delete all messages, members, and issues.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteGroup}>
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;
