
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { FileText, Search, Plus, MessageCircle, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

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

interface GroupIssuesProps {
  groupId: string;
}

// Mock issues data with parent-children themes
const mockIssues: Issue[] = [
  {
    id: "issue1",
    title: "How to discuss screen time limits with teenagers?",
    description: "My teenager is constantly on their devices and I'm concerned about the impact on their sleep and social development. I'd like advice on how to set reasonable screen time limits without causing conflict.",
    userId: "user1",
    userName: "Sarah Johnson",
    createdAt: "2025-05-08T14:30:00",
    tags: ["teens", "screen-time", "boundaries"],
    solutionCount: 4
  },
  {
    id: "issue2",
    title: "Supporting a child through school anxiety",
    description: "My 9-year-old has developed anxiety about going to school. They complain of stomachaches every morning and sometimes cry when it's time to leave. How can I support them and reduce their anxiety?",
    userId: "user3",
    userName: "Emma Wilson",
    createdAt: "2025-05-09T11:15:00",
    tags: ["anxiety", "school", "emotional-support"],
    solutionCount: 3
  },
  {
    id: "issue3",
    title: "Handling sibling rivalry between young children",
    description: "I have a 4-year-old and a 6-year-old who are constantly competing for attention and fighting. I'm exhausted from mediating their conflicts. What strategies work for reducing sibling rivalry?",
    userId: "user2",
    userName: "Michael Chen",
    createdAt: "2025-05-10T09:45:00",
    tags: ["siblings", "conflict-resolution", "family-dynamics"],
    solutionCount: 2
  },
  {
    id: "issue4",
    title: "Talking to teens about dating and relationships",
    description: "My 15-year-old daughter seems interested in dating and I want to have open conversations about healthy relationships, but I'm not sure how to approach it without seeming intrusive or making her uncomfortable.",
    userId: "user4",
    userName: "David Kim",
    createdAt: "2025-05-07T16:20:00",
    tags: ["teens", "relationships", "communication"],
    solutionCount: 5
  }
];

const GroupIssues = ({ groupId }: GroupIssuesProps) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const [newIssueTitle, setNewIssueTitle] = useState("");
  const [newIssueDescription, setNewIssueDescription] = useState("");
  const [newIssueTags, setNewIssueTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Simulate loading issues data
    const loadIssues = async () => {
      try {
        // Would fetch from Supabase in a real implementation
        await new Promise(resolve => setTimeout(resolve, 800));
        setIssues(mockIssues);
      } catch (error) {
        toast({
          title: "Failed to load issues",
          description: "Could not load group issues. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadIssues();
  }, [groupId, toast]);

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
      
      setIssues([newIssue, ...issues]);
      setIsAddDialogOpen(false);
      
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

  // Format date display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Filter issues based on search term and tag
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = searchTerm === "" || 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = filterTag === "" || 
      issue.tags.some(tag => tag.toLowerCase() === filterTag.toLowerCase());
    
    return matchesSearch && matchesTag;
  });

  // Get all unique tags from issues
  const allTags = Array.from(
    new Set(issues.flatMap(issue => issue.tags))
  ).sort();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <select 
            className="border rounded px-3 py-2"
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
        
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={16} className="mr-2" />
          New Issue
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4">
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No Issues Found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {issues.length === 0 
                  ? "Be the first to post an issue to this group!"
                  : "No issues match your search criteria."}
              </p>
              <Button 
                className="mt-4"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Create First Issue
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Issue</TableHead>
                  <TableHead>Posted By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Solutions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{issue.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {issue.description}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {issue.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag size={10} className="mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{issue.userName}</TableCell>
                    <TableCell>{formatDate(issue.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit ml-auto">
                        <MessageCircle size={12} />
                        {issue.solutionCount}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog for adding a new issue */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                placeholder="e.g. design, development, ai (comma separated)"
                disabled={submitting}
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateIssue} disabled={submitting}>
              {submitting ? "Posting..." : "Post Issue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupIssues;
