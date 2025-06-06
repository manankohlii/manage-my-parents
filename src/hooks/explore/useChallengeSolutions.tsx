import { Challenge } from "@/services/challenges/types";

export const useChallengeSolutions = (
  user: any,
  challenges: Challenge[],
  handleSubmitSolution: (challengeId: string, solutionText: string) => Promise<void>,
  updateChallengeStats: (challengeId: string, field: 'solutions_count' | 'votes_count', value: number) => void
) => {
  // Modified handleSubmitSolution to also update challenge stats
  const handleSubmitSolutionWithStats = async (challengeId: string, solutionText: string) => {
    await handleSubmitSolution(challengeId, solutionText);
    
    // Update the challenge solutions count
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      updateChallengeStats(
        challengeId, 
        'solutions_count', 
        (challenge.solutions_count || 0) + 1
      );
    }
  };

  return {
    handleSubmitSolutionWithStats
  };
};
