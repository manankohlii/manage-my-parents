
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, X, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CreateGroupProps {
  onGroupCreated: (groupId: string) => void;
}

const CreateGroup = ({ onGroupCreated }: CreateGroupProps) => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitedMembers, setInvitedMembers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) return;
    
    if (!inviteEmail.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    if (invitedMembers.includes(inviteEmail)) {
      toast({
        title: "Already invited",
        description: "This email has already been invited.",
        variant: "destructive",
      });
      return;
    }
    
    setInvitedMembers([...invitedMembers, inviteEmail]);
    setInviteEmail("");
  };

  const removeInvitedMember = (email: string) => {
    setInvitedMembers(invitedMembers.filter(member => member !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for your group.",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Simulate API call - would save to Supabase in a real implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful creation
      const newGroupId = `group-${Date.now()}`;
      
      toast({
        title: "Group created",
        description: `Successfully created ${groupName}.`,
      });
      
      onGroupCreated(newGroupId);
    } catch (error) {
      toast({
        title: "Failed to create group",
        description: "Could not create the group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Create New Group</CardTitle>
          <CardDescription>
            Create a private group to collaborate with specific members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input 
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Invite Members</Label>
            <div className="flex gap-2">
              <Input 
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
                type="email"
              />
              <Button 
                type="button" 
                onClick={handleInviteMember}
                variant="outline"
              >
                <UserPlus size={16} className="mr-2" />
                Add
              </Button>
            </div>
          </div>
          
          {invitedMembers.length > 0 && (
            <div className="space-y-2">
              <Label>Invited Members</Label>
              <div className="flex flex-wrap gap-2">
                {/* Already included member (the creator) */}
                <Badge variant="secondary" className="flex items-center gap-1">
                  <User size={12} />
                  {user?.email} (You)
                </Badge>
                
                {/* Invited members */}
                {invitedMembers.map(email => (
                  <Badge key={email} variant="outline" className="flex items-center gap-1">
                    {email}
                    <button 
                      type="button" 
                      onClick={() => removeInvitedMember(email)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button">Cancel</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Group"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreateGroup;
