
import { useAuth } from "@/contexts/AuthContext";
import { useChallenges } from "@/hooks/explore/useChallenges";
import { useFiltering } from "@/hooks/explore/useFiltering";
import { useSolutions } from "@/hooks/explore/useSolutions";
import { useVoting } from "@/hooks/explore/useVoting";
import { useDataLoading } from "@/hooks/explore/useDataLoading";
import { useChallengeSolutions } from "@/hooks/explore/useChallengeSolutions";
import { useChallengeVoting } from "@/hooks/explore/useChallengeVoting";

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
    newSolution,
    setNewSolution,
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

  const filteredChallenges = getFilteredChallenges(challenges);
  console.log("Filtered challenges:", filteredChallenges);

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
    newSolution,
    setNewSolution,
    loadingSolution,
    user
  };
};
