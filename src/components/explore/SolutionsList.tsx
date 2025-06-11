import { Button } from "@/components/ui/button";
import { ThumbsUp, Trash2 } from "lucide-react";
import { Solution, deleteSolution, createSolution } from "@/services/solutionsService";
import { toast } from "sonner";
import { useState } from "react";
import { voteGroupSolution } from '@/services/groupSolutionsService';

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

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [localSolutions, setLocalSolutions] = useState(solutions);
  const [solutionVotes, setSolutionVotes] = useState<Record<string, { likes_count: number, user_vote: boolean | null }>>({});

  // Organize solutions into parent/replies
  const parentSolutions = localSolutions.filter(sol => !sol.parent_solution_id);
  const repliesByParent: Record<string, Solution[]> = {};
  localSolutions.forEach(sol => {
    if (sol.parent_solution_id) {
      if (!repliesByParent[sol.parent_solution_id]) repliesByParent[sol.parent_solution_id] = [];
      repliesByParent[sol.parent_solution_id].push(sol);
    }
  });

  const handleDeleteSolution = async (solutionId: string) => {
    try {
      await deleteSolution(solutionId);
      toast.success("Solution deleted successfully");
      setLocalSolutions(prev => prev.filter(sol => sol.id !== solutionId));
      if (onSolutionDeleted) {
        onSolutionDeleted();
      }
    } catch (error) {
      console.error("Error deleting solution:", error);
      toast.error("Failed to delete solution");
    }
  };

  const handleReply = (solutionId: string) => {
    setReplyingTo(solutionId);
    setReplyText("");
  };

  const handleSubmitReply = async (parentSolutionId: string) => {
    if (!replyText.trim()) return;
    const newReply = await createSolution(challengeId, replyText.trim(), user.id, parentSolutionId);
    if (newReply) {
      setLocalSolutions(prev => [...prev, newReply]);
      setReplyingTo(null);
      setReplyText("");
    }
  };

  // Upvote handler
  const handleUpvote = async (solution: Solution) => {
    if (!user) return;
    const prev = solutionVotes[solution.id] || { likes_count: (solution as any).likes_count || 0, user_vote: (solution as any).user_vote ?? null };
    let newLikes = prev.likes_count;
    let newVote = prev.user_vote;
    if (prev.user_vote) {
      newLikes = Math.max(0, newLikes - 1);
      newVote = null;
    } else {
      newLikes = newLikes + 1;
      newVote = true;
    }
    setSolutionVotes(v => ({ ...v, [solution.id]: { likes_count: newLikes, user_vote: newVote } }));
    try {
      await voteGroupSolution(solution.id, user.id, !prev.user_vote);
    } catch {}
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
      <h3 className="text-lg font-medium">Solutions ({parentSolutions.length})</h3>
      {parentSolutions.map((solution) => (
        <div 
          key={solution.id} 
          className="bg-muted/90 dark:bg-muted/60 p-3 rounded-md flex flex-col gap-2 w-full mx-0"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-base break-words whitespace-pre-line mb-2 w-full">{solution.text}</p>
              <p className="text-xs text-muted-foreground mt-1">
                By {solution.author_name || "Anonymous User"} • {new Date(solution.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2 min-w-[120px] justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleUpvote(solution)}
                disabled={!user}
              >
                <ThumbsUp className={solutionVotes[solution.id]?.user_vote ? "text-primary fill-primary" : ""} />
              </Button>
              <span className="text-sm font-medium min-w-[1.5rem] text-center">
                {solutionVotes[solution.id]?.likes_count ?? (solution as any).likes_count ?? 0}
              </span>
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
              <div className="ml-6 mt-2 space-y-2 border-l-2 border-muted-foreground/20 pl-4 bg-muted/40 rounded-md">
                {repliesByParent[solution.id].map(reply => (
                  <div key={reply.id} className="flex justify-between items-center py-1 w-full">
                    <div>
                      <p className="text-xs break-words whitespace-pre-line mb-1 w-full">{reply.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        By {reply.author_name || "Anonymous User"} • {new Date(reply.created_at).toLocaleDateString()}
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

export default SolutionsList;
