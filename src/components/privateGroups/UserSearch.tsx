
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  email: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
}

interface UserSearchProps {
  groupId: string;
  onInviteSent: () => void;
  existingMemberIds: string[];
}

const UserSearch = ({ groupId, onInviteSent, existingMemberIds }: UserSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);
  const { toast } = useToast();

  const searchUsers = async () => {
    if (!searchTerm.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      // Search users by email or display name
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, display_name, first_name, last_name')
        .or(`email.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;

      // Filter out existing members
      const filteredUsers = (data || []).filter(user => 
        !existingMemberIds.includes(user.id)
      );

      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Search failed",
        description: "Could not search users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async (userId: string) => {
    setInviting(userId);
    try {
      // Check if invitation already exists
      const { data: existingInvite } = await supabase
        .from('group_invitations')
        .select('*')
        .eq('group_id', groupId)
        .eq('invited_user_id', userId)
        .maybeSingle();

      if (existingInvite) {
        toast({
          title: "Invitation already sent",
          description: "This user has already been invited to the group.",
          variant: "destructive",
        });
        return;
      }

      // Send invitation
      const { error } = await supabase
        .from('group_invitations')
        .insert({
          group_id: groupId,
          invited_user_id: userId,
          invited_by_user_id: (await supabase.auth.getUser()).data.user?.id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Invitation sent",
        description: "The user has been invited to join the group.",
      });

      onInviteSent();
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Failed to send invitation",
        description: "Could not send the invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setInviting(null);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Search and Invite Users</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {loading && <p className="text-sm text-muted-foreground">Searching...</p>}
          
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {user.display_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.display_name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => sendInvitation(user.id)}
                disabled={inviting === user.id}
              >
                {inviting === user.id ? (
                  "Sending..."
                ) : (
                  <>
                    <UserPlus size={14} className="mr-1" />
                    Invite
                  </>
                )}
              </Button>
            </div>
          ))}
          
          {!loading && searchTerm && users.length === 0 && (
            <p className="text-sm text-muted-foreground">No users found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSearch;
