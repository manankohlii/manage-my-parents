import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, Clock, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Issue } from "./useIssues";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getGroupSolutions, createGroupSolution, GroupSolution } from "@/services/groupSolutionsService";

interface IssueDetailProps {
  issue: Issue;
  formatDate: (dateString: string) => string;
  onBack: () => void;
  userVotes: Record<string, boolean>;
  onVote: (itemId: string, isUpvote: boolean) => void;
}

const IssueDetail = ({ 
  issue, 
  formatDate, 
  onBack,
  userVotes,
  onVote
}: IssueDetailProps) => {
  const [solutions, setSolutions] = useState<GroupSolution[]>([]);
  const [newSolution, setNewSolution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Debug log for user
  console.log("Auth user in IssueDetail:", user);

  useEffect(() => {
    const loadSolutions = async () => {
      try {
        const data = await getGroupSolutions(issue.id);
        setSolutions(data);
      } catch (error) {
        console.error("Error loading solutions:", error);
        toast.error("Failed to load solutions");
      }
    };
    loadSolutions();
  }, [issue.id]);

  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("You must be logged in to submit a solution");
      return;
    }
    if (!newSolution.trim()) {
      toast.error("Solution cannot be empty");
      return;
    }
    setIsSubmitting(true);
    try {
      const solution = await createGroupSolution(issue.id, user.id, newSolution.trim());
      if (solution) {
        setSolutions(prev => [solution, ...prev]);
        setNewSolution("");
        toast.success("Solution submitted successfully!");
      }
    } catch (error) {
      console.error("Error submitting solution:", error);
      toast.error("Failed to submit solution");
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
                  {formatDate(issue.created_at)}
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

            {/* Always show the solution form, disable if not logged in */}
            <form onSubmit={handleSubmitSolution} className="px-6 py-4 border-t">
              <h3 className="text-sm font-medium mb-2">Contribute a solution</h3>
              <Textarea
                placeholder={user ? "Share your solution..." : "Log in to contribute a solution"}
                value={newSolution}
                onChange={(e) => setNewSolution(e.target.value)}
                className="min-h-[100px] mb-2"
                disabled={!user || isSubmitting}
              />
              <Button 
                type="submit" 
                disabled={!user || !newSolution.trim() || isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Submitting..." : "Submit Solution"}
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
                          {formatDate(solution.created_at)}
                        </div>
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
