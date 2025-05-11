
import { useState } from "react";
import { voteChallenge, voteSolution, getUserChallengeVote, getUserSolutionVote } from "@/services/votesService";
import { toast } from "sonner";
import { Challenge } from "@/services/challenges/types";

export const useVoting = (user: any) => {
  const [userVotes, setUserVotes] = useState<Record<string, boolean | null>>({});
  
  // Load user votes for challenges
  const loadUserVotesForChallenges = async (challenges: Challenge[]) => {
    if (!user?.id) return;
    
    try {
      const votes: Record<string, boolean | null> = {};
      
      for (const challenge of challenges) {
        const vote = await getUserChallengeVote(challenge.id, user.id);
        votes[challenge.id] = vote;
      }
      
      setUserVotes(votes);
    } catch (error) {
      console.error("Error loading user votes:", error);
    }
  };
  
  // Load user votes for solutions
  const loadUserVotesForSolutions = async (solutionId: string) => {
    if (!user?.id) return null;
    
    try {
      const vote = await getUserSolutionVote(solutionId, user.id);
      return vote;
    } catch (error) {
      console.error("Error getting solution vote:", error);
      return null;
    }
  };
  
  // Update user votes state when new solutions are loaded
  const updateUserVotesForSolutions = (solutionIds: string[]) => {
    if (!user?.id) return;
    
    const loadVotes = async () => {
      const updatedVotes = { ...userVotes };
      
      for (const solutionId of solutionIds) {
        const vote = await loadUserVotesForSolutions(solutionId);
        updatedVotes[solutionId] = vote;
      }
      
      setUserVotes(updatedVotes);
    };
    
    loadVotes();
  };

  const handleVote = async (challengeId: string, solutionId: string | null, voteType: 'up' | 'down') => {
    if (!user?.id) {
      toast.error("You must be logged in to vote");
      return;
    }
    
    const isUpvote = voteType === 'up';
    let success;
    
    if (solutionId) {
      // Vote on a solution
      success = await voteSolution(solutionId, user.id, isUpvote);
      
      if (success) {
        // Update user votes
        setUserVotes(prev => {
          const currentVote = prev[solutionId];
          return {
            ...prev,
            [solutionId]: currentVote === isUpvote ? null : isUpvote
          };
        });
      }
    } else {
      // Vote on a challenge
      success = await voteChallenge(challengeId, user.id, isUpvote);
      
      if (success) {
        // Update user votes
        setUserVotes(prev => {
          const currentVote = prev[challengeId];
          return {
            ...prev,
            [challengeId]: currentVote === isUpvote ? null : isUpvote
          };
        });
      }
    }
  };

  return {
    userVotes,
    setUserVotes,
    loadUserVotesForChallenges,
    updateUserVotesForSolutions,
    handleVote
  };
};
