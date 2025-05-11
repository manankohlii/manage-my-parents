
import { Challenge } from "@/services/challenges/types";
import { Solution } from "@/services/solutionsService";
import { useState } from "react";

export const useChallengeVoting = (
  user: any, 
  challenges: Challenge[], 
  solutions: Record<string, Solution[]>,
  setSolutions: React.Dispatch<React.SetStateAction<Record<string, Solution[]>>>,
  userVotes: Record<string, boolean | null>,
  handleVote: (challengeId: string, solutionId: string | null, voteType: 'up' | 'down') => Promise<void>,
  updateChallengeStats: (challengeId: string, field: 'solutions_count' | 'votes_count', value: number) => void
) => {
  // Modified handleVote to immediately update UI and then persist in database
  const handleVoteWithStats = async (challengeId: string, solutionId: string | null, voteType: 'up' | 'down') => {
    if (!user) return;
    
    const isUpvote = voteType === 'up';
    
    if (!solutionId) {
      // Handle challenge vote - update UI immediately
      const challenge = challenges.find(c => c.id === challengeId);
      if (challenge) {
        const currentVote = userVotes[challengeId];
        let voteChange = 0;
        
        if (currentVote === null) {
          // New vote
          voteChange = isUpvote ? 1 : -1;
        } else if (currentVote === isUpvote) {
          // Removing vote
          voteChange = isUpvote ? -1 : 1;
        } else {
          // Changing vote direction
          voteChange = isUpvote ? 2 : -2;
        }
        
        // Update vote count in UI immediately
        updateChallengeStats(
          challengeId, 
          'votes_count', 
          (challenge.votes_count || 0) + voteChange
        );
        
        // Then persist to database
        await handleVote(challengeId, null, voteType);
      }
    } else {
      // Handle solution vote - update UI immediately
      const challengeSolutions = solutions[challengeId];
      if (challengeSolutions) {
        const solution = challengeSolutions.find(s => s.id === solutionId);
        if (solution) {
          const currentVote = userVotes[solutionId];
          let voteChange = 0;
          
          if (currentVote === null || currentVote === undefined) {
            // New vote
            voteChange = isUpvote ? 1 : -1;
          } else if (currentVote === isUpvote) {
            // Removing vote
            voteChange = isUpvote ? -1 : 1;
          } else {
            // Changing vote direction
            voteChange = isUpvote ? 2 : -2;
          }
          
          // Update solution votes in UI immediately
          const updatedSolutions = challengeSolutions.map(s => {
            if (s.id === solutionId) {
              return {
                ...s,
                votes: (s.votes || 0) + voteChange
              };
            }
            return s;
          });
          
          setSolutions(prev => ({
            ...prev,
            [challengeId]: updatedSolutions
          }));
          
          // Then persist to database
          await handleVote(challengeId, solutionId, voteType);
        }
      }
    }
  };

  return {
    handleVoteWithStats
  };
};
