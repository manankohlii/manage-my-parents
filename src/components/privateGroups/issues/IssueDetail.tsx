
import { ArrowLeft, MessageCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Issue, IssueSolution } from "./mockIssueData";
import { useAuth } from "@/contexts/AuthContext";

interface IssueDetailProps {
  issue: Issue;
  solutions: IssueSolution[];
  formatDate: (dateString: string) => string;
  onBack: () => void;
  userVotes: Record<string, boolean | null>;
  onVote: (itemId: string, isUpvote: boolean) => void;
}

const IssueDetail = ({ 
  issue, 
  solutions, 
  formatDate, 
  onBack,
  userVotes,
  onVote
}: IssueDetailProps) => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={16} className="mr-2" />
          Back to issues
        </Button>
        
        <div className="flex items-center space-x-2">
          {user && (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center space-x-1"
                onClick={() => onVote(issue.id, true)}
              >
                <ThumbsUp className={`h-4 w-4 ${userVotes[issue.id] === true ? "text-green-500 fill-green-500" : ""}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center space-x-1"
                onClick={() => onVote(issue.id, false)}
              >
                <ThumbsDown className={`h-4 w-4 ${userVotes[issue.id] === false ? "text-red-500 fill-red-500" : ""}`} />
              </Button>
            </>
          )}
          <span className="text-sm text-muted-foreground">
            Posted on {formatDate(issue.createdAt)}
          </span>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold">{issue.title}</h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {issue.tags.map((tag) => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>
        <div className="mt-4 text-muted-foreground">
          Posted by <span className="font-medium text-foreground">{issue.userName}</span>
        </div>
      </div>
      
      <div className="bg-muted p-4 rounded-lg">
        <p>{issue.description}</p>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle size={18} />
            Solutions
          </h3>
        </div>
        
        {solutions.length === 0 ? (
          <div className="text-center p-8 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground">No solutions yet. Be the first to contribute!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {solutions.map((solution) => (
              <div key={solution.id} className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{solution.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(solution.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {user && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onVote(solution.id, true)}
                        >
                          <ThumbsUp className={`h-4 w-4 ${userVotes[solution.id] === true ? "text-green-500 fill-green-500" : ""}`} />
                        </Button>
                        <span className="text-sm font-medium">{solution.votes}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onVote(solution.id, false)}
                        >
                          <ThumbsDown className={`h-4 w-4 ${userVotes[solution.id] === false ? "text-red-500 fill-red-500" : ""}`} />
                        </Button>
                      </>
                    )}
                    {!user && <span className="text-sm font-medium">{solution.votes} votes</span>}
                  </div>
                </div>
                <p className="mt-2">{solution.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueDetail;
