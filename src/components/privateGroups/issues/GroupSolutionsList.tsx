import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Trash2 } from "lucide-react";
import { GroupSolution, createGroupSolution } from '@/services/groupSolutionsService';

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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [localSolutions, setLocalSolutions] = useState(solutions);

  // Organize solutions into parent/replies
  const parentSolutions = localSolutions.filter(sol => !sol.parent_solution_id);
  const repliesByParent: Record<string, GroupSolution[]> = {};
  localSolutions.forEach(sol => {
    if (sol.parent_solution_id) {
      if (!repliesByParent[sol.parent_solution_id]) repliesByParent[sol.parent_solution_id] = [];
      repliesByParent[sol.parent_solution_id].push(sol);
    }
  });

  const handleReply = (solutionId: string) => {
    setReplyingTo(solutionId);
    setReplyText("");
  };

  const handleSubmitReply = async (parentSolutionId: string) => {
    if (!replyText.trim()) return;
    const newReply = await createGroupSolution(challengeId, user.id, replyText.trim(), parentSolutionId);
    if (newReply) {
      setLocalSolutions(prev => [...prev, newReply]);
      setReplyingTo(null);
      setReplyText("");
    }
  };

  const handleDeleteSolution = (solutionId: string) => {
    onDelete(solutionId);
    setLocalSolutions(prev => prev.filter(sol => sol.id !== solutionId));
  };

  const hasSolutions = parentSolutions.length > 0;

  if (!hasSolutions) {
    return (
      <div className="px-6 py-4 text-center text-muted-foreground">
        No solutions yet. Be the first to contribute!
      </div>
    );
  }

  return (
    <div className="px-6 space-y-3 pb-4">
      <h3 className="text-lg font-medium">Solutions ({parentSolutions.length})</h3>
      {parentSolutions.map((solution) => (
        <div 
          key={solution.id} 
          className="bg-muted/90 dark:bg-muted/60 p-3 rounded-md flex flex-col gap-2 w-full mx-0"
          onClick={() => {
            console.log('Solution clicked:', solution);
            if (user) {
              console.log('Current user:', user);
            }
          }}
        >
          <div className="flex justify-between items-start w-full">
            <div className="flex-1 w-full">
              <p className="text-base break-words whitespace-pre-line mb-2 w-full">{solution.text}</p>
              <p className="text-xs text-muted-foreground mt-1">
                By {solution.display_name || "Anonymous User"} • {new Date(solution.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2 min-w-[60px] justify-end">
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
          {/* Reply button and form */}
          <div className="ml-2 mt-2">
            <Button variant="link" size="sm" onClick={() => handleReply(solution.id)}>
              Reply
            </Button>
            {replyingTo === solution.id && (
              <div className="mt-2 w-full">
                <input
                  className="block border rounded px-2 py-1 text-sm w-full max-w-full mb-2"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                />
                <div className="block w-full space-y-2 sm:flex sm:space-y-0 sm:space-x-2">
                  <Button
                    size="sm"
                    className="block w-full sm:w-auto"
                    onClick={() => handleSubmitReply(solution.id)}
                  >
                    Submit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="block w-full sm:w-auto"
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {/* Render replies */}
            {repliesByParent[solution.id]?.length > 0 && (
              <div className="ml-6 mt-2 space-y-2 border-l-2 border-muted-foreground/20 pl-4 bg-muted/40 rounded-md w-full">
                {repliesByParent[solution.id].map(reply => (
                  <div key={reply.id} className="flex justify-between items-center py-1 w-full">
                    <div className="w-full">
                      <p className="text-xs break-words whitespace-pre-line mb-1 w-full">{reply.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        By {reply.display_name || "Anonymous User"} • {new Date(reply.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {user && reply.user_id === user.id ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 ml-2"
                        onClick={() => handleDeleteSolution(reply.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupSolutionsList; 