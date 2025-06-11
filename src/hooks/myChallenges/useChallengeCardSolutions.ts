import { useState } from "react";
import { getSolutions, voteSolution, Solution } from "@/services/solutionsService";
import { toast } from "sonner";

export const useChallengeCardSolutions = (challengeId: string, userId?: string) => {
  const [showSolutions, setShowSolutions] = useState(false);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, boolean | null>>({});

  const handleViewSolutions = async () => {
    if (showSolutions) {
      // Just toggle off if already showing
      setShowSolutions(false);
      return;
    }

    setLoading(true);
    try {
      const fetchedSolutions = await getSolutions(challengeId);
      setSolutions(fetchedSolutions);
      
      // Initialize user votes state
      if (userId) {
        const initialUserVotes: Record<string, boolean | null> = {};
        fetchedSolutions.forEach(solution => {
          initialUserVotes[solution.id] = null;
        });
        setUserVotes(initialUserVotes);
      }
      
      setShowSolutions(true);
    } catch (error) {
      console.error("Failed to fetch solutions:", error);
      toast.error("Failed to load solutions");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (challengeId: string, solutionId: string, voteType: 'up' | 'down') => {
    if (!userId) {
      toast.error("You must be logged in to vote");
      return;
    }

    try {
      // Determine if this is an upvote (true) or downvote (false)
      const isUpvote = voteType === 'up';
      
      // If user already voted the same way, consider it a vote removal
      const isRemovingVote = userVotes[solutionId] === isUpvote;
      
      // Update optimistic UI first
      setUserVotes(prev => ({
        ...prev,
        [solutionId]: isRemovingVote ? null : isUpvote
      }));
      
      // Update the solution in the database
      await voteSolution(solutionId, userId, isRemovingVote ? null : isUpvote);
      
      // Refresh solutions to get updated vote counts
      const updatedSolutions = await getSolutions(challengeId);
      setSolutions(updatedSolutions);
    } catch (error) {
      console.error("Failed to register vote:", error);
      toast.error("Failed to register your vote");
      
      // Revert optimistic UI update on error
      setUserVotes(prev => ({
        ...prev,
        [solutionId]: prev[solutionId]
      }));
    }
  };

  return {
    showSolutions,
    setShowSolutions,
    solutions,
    setSolutions,
    loading,
    userVotes,
    handleViewSolutions,
    handleVote
  };
};
