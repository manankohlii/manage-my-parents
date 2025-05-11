
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Solution } from "@/services/solutionsService";

interface SolutionsListProps {
  solutions: Solution[];
  challengeId: string;
  handleVote: (challengeId: string, solutionId: string, voteType: 'up' | 'down') => Promise<void>;
  userVotes: Record<string, boolean | null>;
  user: any;
}

const SolutionsList = ({ 
  solutions = [], // Provide a default empty array
  challengeId, 
  handleVote, 
  userVotes,
  user
}: SolutionsListProps) => {
  // Check if solutions exists and has items
  const hasSolutions = solutions && solutions.length > 0;

  if (!hasSolutions) {
    return (
      <div className="px-6 py-4 text-center text-muted-foreground">
        No solutions yet. Be the first to contribute!
      </div>
    );
  }

  return (
    <div className="px-6 space-y-3">
      <h3 className="text-lg font-medium">Solutions ({solutions.length})</h3>
      {solutions.map((solution) => (
        <div 
          key={solution.id} 
          className="bg-muted p-3 rounded-md flex justify-between items-start"
        >
          <div className="flex-1">
            <p className="text-sm">{solution.text}</p>
            <p className="text-xs text-muted-foreground mt-1">
              By {solution.author_name || "Anonymous User"} • {new Date(solution.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-1 ml-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => handleVote(challengeId, solution.id, 'up')}
              disabled={!user}
            >
              <ThumbsUp 
                size={16} 
                className={userVotes[solution.id] === true ? "text-green-500 fill-green-500" : ""} 
              />
            </Button>
            <span className="text-sm font-medium min-w-[24px] text-center">{solution.votes || 0}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => handleVote(challengeId, solution.id, 'down')}
              disabled={!user}
            >
              <ThumbsDown 
                size={16} 
                className={userVotes[solution.id] === false ? "text-red-500 fill-red-500" : ""} 
              />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SolutionsList;
