
import { useEffect } from "react";
import { Challenge } from "@/services/challenges/types";

export const useDataLoading = (
  user: any,
  challenges: Challenge[],
  loadUserVotesForChallenges: (challenges: Challenge[]) => void,
  loadSolutions: (challengeId: string) => Promise<void>
) => {
  // Load user votes when challenges change and user is available
  useEffect(() => {
    if (challenges.length > 0 && user?.id) {
      loadUserVotesForChallenges(challenges);
    }
  }, [challenges, user?.id]);
  
  // Load solutions for challenges with solutions_count > 0
  useEffect(() => {
    if (challenges.length > 0) {
      console.log("Loading solutions for challenges:", challenges);
      challenges.forEach(challenge => {
        if ((challenge.solutions_count || 0) > 0) {
          loadSolutions(challenge.id);
        }
      });
    }
  }, [challenges]);
};
