import { useAuth } from "@/contexts/AuthContext";
import { useChallenges } from "@/hooks/explore/useChallenges";
import { useFiltering } from "@/hooks/explore/useFiltering";
import { useSolutions } from "@/hooks/explore/useSolutions";
import { useVoting } from "@/hooks/explore/useVoting";
import { useEffect } from "react";

export const useChallengeListing = () => {
  const { user } = useAuth();
  
  // Use our refactored hooks
  const { 
    challenges, 
    setChallenges,
    loading, 
    allTags,
    updateChallengeStats
  } = useChallenges();
  
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
    setUserVotes,
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
        
        // Update upvote count in UI immediately
        updateChallengeStats(
          challengeId, 
          'likes_count', 
          (challenge.likes_count || 0) + voteChange
        );
        // Update userVotes immediately
        setUserVotes(prev => ({
          ...prev,
          [challengeId]: currentVote === isUpvote ? null : isUpvote
        }));
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
    loading,
    filteredChallenges: getFilteredChallenges(challenges),
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
