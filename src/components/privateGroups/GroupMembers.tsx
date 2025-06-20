import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Users, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import UserSearch from "./UserSearch";
import { useAuth } from "@/contexts/AuthContext";
import { useGroupDetail } from "@/hooks/privateGroups/useGroupDetail";

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
  const { user } = useAuth();
  const { removeMember, refreshGroup } = useGroupDetail(groupId);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [localMembers, setLocalMembers] = useState<Member[]>(members);

  useEffect(() => {
    setLocalMembers(members);
  }, [members]);

  const handleInviteSent = () => {
    onMembersChange?.();
  };

  const handleRemoveClick = (member: Member) => {
    setMemberToRemove(member);
  };

  const handleConfirmRemove = async () => {
    if (memberToRemove) {
      await removeMember(memberToRemove.id);
      setMemberToRemove(null);
      setLocalMembers(prev => prev.filter(m => m.id !== memberToRemove.id));
      await refreshGroup();
      onMembersChange?.();
    }
  };

  // Check if current user is admin
  const isAdmin = members.find(m => m.id === user?.id)?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Group Members ({members.length})</h3>
      </div>
      
      {isAdmin ? (
        <UserSearch 
          groupId={groupId} 
          onInviteSent={handleInviteSent}
          existingMemberIds={members.map(m => m.id)}
        />
      ) : (
        <Card className="p-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <UserPlus className="h-8 w-8 text-muted-foreground" />
            <div>
              <h4 className="font-medium">Only admins can manage members</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Please contact a group admin if you need to add or remove members.
              </p>
            </div>
          </div>
        </Card>
      )}
      
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-4">Member List</h4>
        <div className="space-y-4">
          {localMembers.map((member) => (
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
              {isAdmin && member.role !== "admin" && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  onClick={() => handleRemoveClick(member)}
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Remove confirmation dialog */}
      {memberToRemove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Remove Member</h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to remove {memberToRemove.name} from the group? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setMemberToRemove(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmRemove}>
                Remove Member
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupMembers;
