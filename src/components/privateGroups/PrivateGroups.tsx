import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserPlus, Users, MessageCircle, FileText, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import GroupsList from "./GroupsList";
import CreateGroup from "./CreateGroup";
import GroupInvitations from "./GroupInvitations";
import GroupDetail from "./GroupDetail";
import { useInvitationCount } from "@/hooks/privateGroups/useInvitationCount";

const PrivateGroups = () => {
  const [activeTab, setActiveTab] = useState("my-groups");
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [groupsRefreshTrigger, setGroupsRefreshTrigger] = useState(0);
  const { count: pendingInvitationsCount } = useInvitationCount();

  const handleGroupJoined = () => {
    console.log('🎉 Group joined - triggering refresh and switching to My Groups');
    // First trigger the refresh
    setGroupsRefreshTrigger(prev => prev + 1);
    
    // Wait for refresh to complete before switching tabs
    setTimeout(() => {
      setActiveTab("my-groups");
    }, 1500); // Increased delay to ensure refresh completes
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Private Groups</h2>
      </div>
      
      {!activeGroupId ? (
        // Show tabs when not in a specific group
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="my-groups" className="flex items-center gap-2">
              <Users size={16} />
              My Groups
            </TabsTrigger>
            <TabsTrigger value="create-group" className="flex items-center gap-2">
              <UserPlus size={16} />
              Create Group
            </TabsTrigger>
            <TabsTrigger value="invitations" className="flex items-center gap-2 relative">
              <Bell size={16} />
              Invitations
              {pendingInvitationsCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {pendingInvitationsCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-groups">
            <GroupsList 
              onSelectGroup={(groupId) => setActiveGroupId(groupId)}
              refreshTrigger={groupsRefreshTrigger}
            />
          </TabsContent>
          
          <TabsContent value="create-group">
            <CreateGroup onGroupCreated={(groupId) => setActiveGroupId(groupId)} />
          </TabsContent>
          
          <TabsContent value="invitations">
            <GroupInvitations 
              onGroupJoined={handleGroupJoined}
            />
          </TabsContent>
        </Tabs>
      ) : (
        // Show group detail when a specific group is selected
        <GroupDetail 
          groupId={activeGroupId} 
          onBack={() => setActiveGroupId(null)} 
        />
      )}
    </div>
  );
};

export default PrivateGroups;
