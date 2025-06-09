import { Button } from "@/components/ui/button";
import { ThumbsUp, Trash2 } from "lucide-react";
import { GroupSolution } from '@/services/groupSolutionsService';

interface GroupSolutionsListProps {
  solutions: GroupSolution[];
  challengeId: string;
  user: any;
  onDelete: (solutionId: string) => void;
}

const GroupSolutionsList = ({
  solutions = [],
  challengeId,
  user,
  onDelete
}: GroupSolutionsListProps) => {
  const hasSolutions = Array.isArray(solutions) && solutions.length > 0;

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
              By {solution.display_name || "Anonymous User"} • {new Date(solution.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2 min-w-[60px] justify-end">
            {/* Only show delete button for the user who posted the solution */}
            {user && solution.user_id === user.id ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={() => {
                  console.log("Delete button clicked", { solutionId: solution.id });
                  onDelete(solution.id);
                }}
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

export default GroupSolutionsList; 