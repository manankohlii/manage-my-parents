import { Button } from "@/components/ui/button";
import { ThumbsUp, Trash2 } from "lucide-react";
import { Solution, deleteSolution } from "@/services/solutionsService";
import { toast } from "sonner";

interface SolutionsListProps {
  solutions: Solution[];
  challengeId: string;
  handleVote: (challengeId: string, solutionId: string, voteType: 'up' | 'down') => Promise<void>;
  userVotes: Record<string, boolean | null>;
  user: any;
  onSolutionDeleted?: () => void;
}

const SolutionsList = ({ 
  solutions = [], 
  challengeId, 
  handleVote, 
  userVotes,
  user,
  onSolutionDeleted
}: SolutionsListProps) => {
  // Check if solutions exists and has items
  const hasSolutions = Array.isArray(solutions) && solutions.length > 0;

  const handleDeleteSolution = async (solutionId: string) => {
    try {
      await deleteSolution(solutionId);
      toast.success("Solution deleted successfully");
      if (onSolutionDeleted) {
        onSolutionDeleted();
      }
    } catch (error) {
      console.error("Error deleting solution:", error);
      toast.error("Failed to delete solution");
    }
  };

  if (!hasSolutions) {
    return (
      <div className="px-6 py-4 text-center text-muted-foreground">
        No solutions yet. Be the first to contribute!
      </div>
    );
  }

  return (
    <div className="px-6 space-y-3 pb-4">
      <h3 className="text-lg font-medium">Solutions ({solutions.length})</h3>
      {solutions.map((solution) => (
        <div 
          key={solution.id} 
          className="bg-muted/90 dark:bg-muted/60 p-3 rounded-md flex justify-between items-start"
        >
          <div className="flex-1">
            <p className="text-sm">{solution.text}</p>
            <p className="text-xs text-muted-foreground mt-1">
              By {solution.author_name || "Anonymous User"} • {new Date(solution.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex items-center gap-2 min-w-[120px] justify-end">
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
            {/* Always render a delete button, but invisible if not owned by user */}
            {user && solution.user_id === user.id ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={() => handleDeleteSolution(solution.id)}
              >
                <Trash2 size={16} />
              </Button>
            ) : (
              <span className="h-8 w-8 inline-block" style={{ visibility: 'hidden' }}>
                <Trash2 size={16} />
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SolutionsList;
