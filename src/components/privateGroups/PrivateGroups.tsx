
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserPlus, Users, MessageCircle, FileText, Bell } from "lucide-react";
import GroupsList from "./GroupsList";
import CreateGroup from "./CreateGroup";
import GroupInvitations from "./GroupInvitations";
import GroupDetail from "./GroupDetail";

const PrivateGroups = () => {
  const [activeTab, setActiveTab] = useState("my-groups");
  // Active group when user selects a specific group
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

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
            <TabsTrigger value="invitations" className="flex items-center gap-2">
              <Bell size={16} />
              Invitations
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-groups">
            <GroupsList onSelectGroup={(groupId) => setActiveGroupId(groupId)} />
          </TabsContent>
          
          <TabsContent value="create-group">
            <CreateGroup onGroupCreated={(groupId) => setActiveGroupId(groupId)} />
          </TabsContent>
          
          <TabsContent value="invitations">
            <GroupInvitations />
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
