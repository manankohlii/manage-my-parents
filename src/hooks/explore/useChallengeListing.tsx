import { useAuth } from "@/contexts/AuthContext";
import { useChallenges } from "@/hooks/explore/useChallenges";
import { useFiltering } from "@/hooks/explore/useFiltering";
import { useSolutions } from "@/hooks/explore/useSolutions";
import { useVoting } from "@/hooks/explore/useVoting";
import { useDataLoading } from "@/hooks/explore/useDataLoading";
import { useChallengeSolutions } from "@/hooks/explore/useChallengeSolutions";
import { useChallengeVoting } from "@/hooks/explore/useChallengeVoting";
import { useEffect } from "react";

// Add debugging console log
console.log("Loading useChallengeListing hook");

export const useChallengeListing = () => {
  const { user } = useAuth();
  console.log("Current user:", user);
  
  // Use our refactored hooks
  const { 
    challenges, 
    setChallenges,
    loading, 
    allTags,
    updateChallengeStats
  } = useChallenges();
  
  console.log("Challenges from useChallenges:", challenges);
  
  const {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filterAgeGroup,
    setFilterAgeGroup,
    filterLocation,
    setFilterLocation,
    selectedTags,
    setSelectedTags,
    getFilteredChallenges
  } = useFiltering();
  
  const {
    userVotes,
    loadUserVotesForChallenges,
    updateUserVotesForSolutions,
    handleVote
  } = useVoting(user);
  
  const {
    solutions,
    setSolutions,
    openPopover,
    setOpenPopover,
    loadingSolution,
    loadSolutions,
    handleSubmitSolution
  } = useSolutions(user, updateUserVotesForSolutions);
  
  // Use our new hooks
  useDataLoading(
    user,
    challenges,
    loadUserVotesForChallenges,
    loadSolutions
  );
  
  const { handleSubmitSolutionWithStats } = useChallengeSolutions(
    user,
    challenges,
    handleSubmitSolution,
    updateChallengeStats
  );
  
  const { handleVoteWithStats } = useChallengeVoting(
    user,
    challenges,
    solutions,
    setSolutions,
    userVotes,
    handleVote,
    updateChallengeStats
  );

  const handleSolutionDeleted = async (challengeId: string) => {
    // Reload solutions for the challenge
    await loadSolutions(challengeId);
    
    // Update the challenge solutions count
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      updateChallengeStats(
        challengeId, 
        'solutions_count', 
        Math.max(0, (challenge.solutions_count || 0) - 1)
      );
    }
  };

  const filteredChallenges = getFilteredChallenges(challenges);
  console.log("Filtered challenges:", filteredChallenges);

  // Load user votes when challenges change and user is available
  useEffect(() => {
    if (challenges.length > 0 && user?.id) {
      loadUserVotesForChallenges(challenges);
    }
  }, [challenges, user?.id]);
  
  // Load solutions for challenges with solutions_count > 0
  useEffect(() => {
    if (challenges.length > 0) {
      challenges.forEach(challenge => {
        if ((challenge.solutions_count || 0) > 0) {
          loadSolutions(challenge.id);
        }
      });
    }
  }, [challenges]);

  return {
    loading,
    filteredChallenges,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filterAgeGroup,
    setFilterAgeGroup,
    filterLocation,
    setFilterLocation,
    selectedTags,
    setSelectedTags,
    allTags,
    solutions,
    loadSolutions,
    userVotes,
    handleVote: handleVoteWithStats,
    openPopover,
    setOpenPopover,
    handleSubmitSolution: handleSubmitSolutionWithStats,
    loadingSolution,
    user,
    handleSolutionDeleted
  };
};
