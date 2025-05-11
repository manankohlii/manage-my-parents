
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface Issue {
  id: string;
  title: string;
  description: string;
  userId: string;
  userName: string;
  createdAt: string;
  tags: string[];
  solutionCount: number;
}

interface IssueFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onIssueCreate: (issue: Issue) => void;
}

const IssueForm = ({ isOpen, onOpenChange, onIssueCreate }: IssueFormProps) => {
  const [newIssueTitle, setNewIssueTitle] = useState("");
  const [newIssueDescription, setNewIssueDescription] = useState("");
  const [newIssueTags, setNewIssueTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCreateIssue = async () => {
    if (!newIssueTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your issue.",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Simulate API call - would save to Supabase in a real implementation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create new issue
      const tagsArray = newIssueTags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag !== "");
      
      const newIssue: Issue = {
        id: `issue-${Date.now()}`,
        title: newIssueTitle.trim(),
        description: newIssueDescription.trim(),
        userId: user?.id || 'current-user',
        userName: user?.email?.split('@')[0] || 'You',
        createdAt: new Date().toISOString(),
        tags: tagsArray,
        solutionCount: 0
      };
      
      onIssueCreate(newIssue);
      onOpenChange(false);
      
      toast({
        title: "Issue created",
        description: "Your issue has been posted to the group.",
      });
      
      // Reset form
      setNewIssueTitle("");
      setNewIssueDescription("");
      setNewIssueTags("");
      
    } catch (error) {
      toast({
        title: "Failed to create issue",
        description: "Could not create your issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Post a New Issue</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="issueTitle" className="text-sm font-medium">Title</label>
            <Input 
              id="issueTitle"
              value={newIssueTitle}
              onChange={(e) => setNewIssueTitle(e.target.value)}
              placeholder="What's your issue about?"
              disabled={submitting}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="issueDescription" className="text-sm font-medium">Description</label>
            <Textarea 
              id="issueDescription"
              value={newIssueDescription}
              onChange={(e) => setNewIssueDescription(e.target.value)}
              placeholder="Provide details about your issue..."
              rows={5}
              disabled={submitting}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="issueTags" className="text-sm font-medium">Tags</label>
            <Input 
              id="issueTags"
              value={newIssueTags}
              onChange={(e) => setNewIssueTags(e.target.value)}
              placeholder="e.g. teens, emotional-support, boundaries (comma separated)"
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateIssue} disabled={submitting}>
            {submitting ? "Posting..." : "Post Issue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IssueForm;
