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
          <div className="relative">
            <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              <TabsList className="mb-6 inline-flex min-w-full sm:min-w-0 sm:w-auto gap-2 sm:gap-4">
                <TabsTrigger value="my-groups" className="flex items-center gap-2 whitespace-nowrap">
                  <Users size={16} className="shrink-0" />
                  <span>My Groups</span>
                </TabsTrigger>
                <TabsTrigger value="create-group" className="flex items-center gap-2 whitespace-nowrap">
                  <UserPlus size={16} className="shrink-0" />
                  <span>Create Group</span>
                </TabsTrigger>
                <TabsTrigger value="invitations" className="flex items-center gap-2 whitespace-nowrap relative">
                  <Bell size={16} className="shrink-0" />
                  <span>Invitations</span>
                  {pendingInvitationsCount > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                      {pendingInvitationsCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <TabsContent value="my-groups" className="mt-4">
            <GroupsList 
              onSelectGroup={(groupId) => setActiveGroupId(groupId)}
              refreshTrigger={groupsRefreshTrigger}
            />
          </TabsContent>
          
          <TabsContent value="create-group" className="mt-4">
            <CreateGroup onGroupCreated={(groupId) => setActiveGroupId(groupId)} />
          </TabsContent>
          
          <TabsContent value="invitations" className="mt-4">
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
