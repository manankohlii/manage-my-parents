
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Mail, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useGroupDetail } from "@/hooks/privateGroups/useGroupDetail";
import UserSearch from "./UserSearch";

interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "member";
}

interface GroupMembersProps {
  groupId: string;
  members: Member[];
  onMembersChange?: () => void;
}

const GroupMembers = ({ groupId, members, onMembersChange }: GroupMembersProps) => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const { inviteMember } = useGroupDetail(groupId);

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;
    
    if (!inviteEmail.includes('@')) {
      return;
    }
    
    setInviting(true);
    
    try {
      await inviteMember(inviteEmail);
      setInviteEmail("");
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setInviting(false);
    }
  };

  const handleInviteSent = () => {
    // Call the refresh callback instead of page refresh
    onMembersChange?.();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Group Members ({members.length})</h3>
      </div>
      
      <div className="space-y-4">
        <UserSearch 
          groupId={groupId} 
          onInviteSent={handleInviteSent}
          existingMemberIds={members.map(m => m.id)}
        />
        
        <Card className="p-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Invite by Email</h4>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="pl-9"
                  type="email"
                  disabled={inviting}
                />
              </div>
              <Button 
                onClick={handleInviteMember}
                disabled={!inviteEmail.trim() || inviting}
              >
                <UserPlus size={16} className="mr-2" />
                Invite
              </Button>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-4">Member List</h4>
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {member.avatar ? (
                      <AvatarImage src={member.avatar} alt={member.name} />
                    ) : (
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {member.name}
                      {member.role === "admin" && (
                        <Badge variant="secondary" className="text-xs">Admin</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{member.email}</div>
                  </div>
                </div>
                
                {/* Only show remove button for non-admins if current user is admin */}
                {member.role !== "admin" && (
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                    <X size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GroupMembers;
