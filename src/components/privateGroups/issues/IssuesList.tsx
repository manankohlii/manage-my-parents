
import { CircleX, MessageCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Issue } from "./mockIssueData";
import { useAuth } from "@/contexts/AuthContext";

interface IssuesListProps {
  issues: Issue[];
  filteredIssues: Issue[];
  loading: boolean;
  formatDate: (dateString: string) => string;
  onOpenAddDialog: () => void;
  onSelectIssue: (issueId: string) => void;
  userVotes: Record<string, boolean | null>;
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
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <div className="flex flex-wrap gap-2 mt-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <Card className="w-full text-center p-6">
        <CardContent className="pt-4">
          <CircleX className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No Issues Yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            There are no issues in this group yet.
          </p>
          <Button className="mt-4" onClick={onOpenAddDialog}>
            Create First Issue
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (filteredIssues.length === 0) {
    return (
      <Card className="w-full text-center p-6">
        <CardContent className="pt-4">
          <CircleX className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No Matching Issues</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            No issues match your current filters.
          </p>
          <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
            Clear Filters
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filteredIssues.map((issue) => (
        <Card key={issue.id} className="w-full hover:bg-muted/50 transition-colors">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg hover:text-primary cursor-pointer" onClick={() => onSelectIssue(issue.id)}>
                  {issue.title}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {issue.tags.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDate(issue.createdAt)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {issue.description}
            </p>
            <p className="mt-2 text-xs">
              Posted by <span className="font-medium">{issue.userName}</span>
            </p>
          </CardContent>
          <CardFooter className="justify-between">
            <div className="flex items-center space-x-1">
              <MessageCircle size={16} />
              <span className="text-sm">{issue.solutionCount} solutions</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {user && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onVote(issue.id, true);
                    }}
                  >
                    <ThumbsUp className={`h-4 w-4 ${userVotes[issue.id] === true ? "text-green-500 fill-green-500" : ""}`} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onVote(issue.id, false);
                    }}
                  >
                    <ThumbsDown className={`h-4 w-4 ${userVotes[issue.id] === false ? "text-red-500 fill-red-500" : ""}`} />
                  </Button>
                </>
              )}
              <Button 
                variant="default" 
                size="sm"
                onClick={() => onSelectIssue(issue.id)}
              >
                View Details
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default IssuesList;
