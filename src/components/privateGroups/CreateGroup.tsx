
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePrivateGroups } from "@/hooks/privateGroups/usePrivateGroups";

interface CreateGroupProps {
  onGroupCreated: (groupId: string) => void;
}

const CreateGroup = ({ onGroupCreated }: CreateGroupProps) => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { createGroup } = usePrivateGroups();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const groupId = await createGroup(groupName, description);
      if (groupId) {
        onGroupCreated(groupId);
      }
    } catch (error) {
      // Error handling is done in the hook
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
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea 
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Group Creator</Label>
            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
              <User size={12} />
              {user?.email} (You - Admin)
            </Badge>
            <p className="text-xs text-muted-foreground">
              You can add more members after creating the group.
            </p>
          </div>
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
