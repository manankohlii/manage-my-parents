import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, Clock, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Issue } from "./useIssues";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface IssueSolution {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: string;
  votes: number;
}

interface IssueDetailProps {
  issue: Issue;
  solutions: IssueSolution[];
  formatDate: (dateString: string) => string;
  onBack: () => void;
  userVotes: Record<string, boolean>;
  onVote: (itemId: string, isUpvote: boolean) => void;
  onSolutionAdd: (solution: IssueSolution) => void;
}

const IssueDetail = ({
  issue,
  solutions,
  formatDate,
  onBack,
  userVotes,
  onVote,
  onSolutionAdd
}: IssueDetailProps) => {
  const [newSolution, setNewSolution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to post a solution.",
        variant: "destructive",
      });
      return;
    }

    if (!newSolution.trim()) {
      toast({
        title: "Error",
        description: "Please enter a solution before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a new solution object
      const newSolutionObj: IssueSolution = {
        id: `temp-${Date.now()}`, // Temporary ID until saved to database
        text: newSolution.trim(),
        userId: user.id,
        userName: user.user_metadata?.full_name || 'Anonymous',
        createdAt: new Date().toISOString(),
        votes: 0
      };

      // Call the parent component's handler to add the solution
      onSolutionAdd(newSolutionObj);
      
      toast({
        title: "Success",
        description: "Your solution has been posted!",
      });
      setNewSolution("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post solution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-semibold">Challenge Details</h2>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">{issue.title}</CardTitle>
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
                  {solutions.length}
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
                  onClick={() => onVote(issue.id, true)}
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
        <CardContent>
          <p className="text-muted-foreground mb-4">{issue.description}</p>
          {issue.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {issue.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Solutions</h3>
            </div>

            <form onSubmit={handleSubmitSolution} className="space-y-4">
              <Textarea
                placeholder="Share your solution..."
                value={newSolution}
                onChange={(e) => setNewSolution(e.target.value)}
                className="min-h-[100px]"
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Solution"}
              </Button>
            </form>

            <div className="space-y-4">
              {solutions.map((solution) => (
                <Card key={solution.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-sm">{solution.text}</p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Posted by {solution.userName} • {formatDate(solution.createdAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-8 w-8",
                            userVotes[solution.id] === true && "text-primary"
                          )}
                          onClick={() => onVote(solution.id, true)}
                        >
                          <ThumbsUp size={16} />
                        </Button>
                        <span className="text-sm font-medium min-w-[1.5rem] text-center">
                          {solution.votes}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueDetail;
