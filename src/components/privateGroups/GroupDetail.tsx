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
  const { group, loading, leaveGroup } = useGroupDetail(groupId);
  const { deleteGroup } = usePrivateGroups();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("chat");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 flex-wrap">
              {group.name}
              <Badge variant="outline" className="text-xs">
                {group.members.length} members
              </Badge>
            </h2>
            <p className="text-muted-foreground text-sm">Private group for collaboration</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Member avatars */}
          <div className="flex -space-x-2">
            {group.members.slice(0, 3).map((member) => (
              <Avatar key={member.id} className="border-2 border-background w-7 h-7 sm:w-8 sm:h-8">
                <AvatarFallback className="text-xs">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
            {group.members.length > 3 && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                +{group.members.length - 3}
              </div>
            )}
          </div>
          
          {/* Delete button for admins, Leave button for non-admins */}
          {isAdmin ? (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="whitespace-nowrap"
            >
              Delete Group
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLeaveConfirm(true)}
              className="whitespace-nowrap"
            >
              Leave Group
            </Button>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="relative">
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="mb-6 inline-flex min-w-full sm:min-w-0 sm:w-auto gap-2 sm:gap-4">
              <TabsTrigger value="chat" className="flex items-center gap-2 whitespace-nowrap">
                <MessageCircle size={16} className="shrink-0" />
                <span>Group Chat</span>
              </TabsTrigger>
              <TabsTrigger value="issues" className="flex items-center gap-2 whitespace-nowrap">
                <FileText size={16} className="shrink-0" />
                <span>Challenges & Solutions</span>
              </TabsTrigger>
              <TabsTrigger value="members" className="flex items-center gap-2 whitespace-nowrap">
                <User size={16} className="shrink-0" />
                <span>Members</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="chat" className="mt-4">
          <GroupChat groupId={groupId} />
        </TabsContent>
        
        <TabsContent value="issues" className="mt-4">
          <GroupIssues groupId={groupId} />
        </TabsContent>
        
        <TabsContent value="members" className="mt-4">
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

      {/* Leave confirmation dialog for non-admins */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Leave Group</h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to leave "{group.name}"? You will lose access to all group content.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowLeaveConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={async () => {
                await leaveGroup();
                setShowLeaveConfirm(false);
                onBack();
              }}>
                Leave Group
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;
