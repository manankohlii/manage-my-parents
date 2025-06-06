import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Issue } from "./useIssues";

interface IssuesListProps {
  issues: Issue[];
  filteredIssues: Issue[];
  loading: boolean;
  formatDate: (dateString: string) => string;
  onOpenAddDialog: () => void;
  onSelectIssue: (issueId: string) => void;
  userVotes: Record<string, boolean>;
  onVote: (itemId: string, isUpvote: boolean) => void;
}

const IssuesList = ({
  issues,
  filteredIssues,
  loading,
  formatDate,
  onOpenAddDialog,
  onSelectIssue,
  userVotes,
  onVote
}: IssuesListProps) => {
  const { toast } = useToast();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    onSelectIssue(issue.id);
  };

  if (loading) {
    return <div>Loading challenges...</div>;
  }

  if (issues.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          No challenges posted yet. Be the first to share a challenge!
          </p>
        <Button onClick={onOpenAddDialog}>
          Share Your First Challenge
          </Button>
      </div>
    );
  }

  if (filteredIssues.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No challenges match your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredIssues.map((issue) => (
        <Card
          key={issue.id}
          className={`cursor-pointer transition-colors hover:bg-accent/50 ${
            selectedIssue?.id === issue.id ? 'bg-accent' : ''
          }`}
          onClick={() => handleIssueClick(issue)}
        >
          <CardHeader className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{issue.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Posted by {issue.userName}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(issue.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {issue.solutionCount}
                  </Badge>
            </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={cn(
                      "h-8 w-8",
                      userVotes[issue.id] === true && "text-primary"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onVote(issue.id, true);
                    }}
                  >
                    <ThumbsUp size={16} />
                  </Button>
                  <span className="text-sm font-medium min-w-[1.5rem] text-center">
                    {issue.votes}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {issue.description}
                </p>
                {issue.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {issue.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default IssuesList;
