
import { useAuth } from "@/contexts/AuthContext";
import { useChallenges } from "@/hooks/explore/useChallenges";
import { useFiltering } from "@/hooks/explore/useFiltering";
import { useSolutions } from "@/hooks/explore/useSolutions";
import { useVoting } from "@/hooks/explore/useVoting";
import { useEffect } from "react";

// Add debugging console logs
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

  // Modified handleSubmitSolution to also update challenge stats
  const handleSubmitSolutionWithStats = async (challengeId: string) => {
    await handleSubmitSolution(challengeId);
    
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
        
        // Update user vote state immediately
        const updatedUserVotes = { 
          ...userVotes, 
          [challengeId]: currentVote === isUpvote ? null : isUpvote 
        };
        
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
