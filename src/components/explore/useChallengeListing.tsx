
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllChallenges, Challenge } from "@/services/challengesService";
import { createSolution, getSolutions, Solution } from "@/services/solutionsService";
import { voteChallenge, voteSolution, getUserChallengeVote, getUserSolutionVote } from "@/services/votesService";
import { getAllTags } from "@/services/challengesService";
import { toast } from "sonner";

export const useChallengeListing = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [solutions, setSolutions] = useState<Record<string, Solution[]>>({});
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("popular");
  const [filterAgeGroup, setFilterAgeGroup] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [newSolution, setNewSolution] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, boolean | null>>({});
  const [loadingSolution, setLoadingSolution] = useState(false);

  // Load challenges and tags
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        const [fetchedChallenges, fetchedTags] = await Promise.all([
          getAllChallenges(),
          getAllTags()
        ]);
        
        setChallenges(fetchedChallenges);
        setAllTags(fetchedTags);
        
        // Load user votes if user is logged in
        if (user?.id) {
          const votes: Record<string, boolean | null> = {};
          
          for (const challenge of fetchedChallenges) {
            const vote = await getUserChallengeVote(challenge.id, user.id);
            votes[challenge.id] = vote;
          }
          
          setUserVotes(votes);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load challenges");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user?.id]);

  // Load solutions for a challenge when expanded
  const loadSolutions = async (challengeId: string) => {
    if (solutions[challengeId]) return;
    
    try {
      const fetchedSolutions = await getSolutions(challengeId);
      setSolutions(prev => ({
        ...prev,
        [challengeId]: fetchedSolutions
      }));
      
      // Load user votes for solutions if user is logged in
      if (user?.id) {
        const updatedVotes = { ...userVotes };
        
        for (const solution of fetchedSolutions) {
          const vote = await getUserSolutionVote(solution.id, user.id);
          updatedVotes[solution.id] = vote;
        }
        
        setUserVotes(updatedVotes);
      }
    } catch (error) {
      console.error("Error loading solutions:", error);
      toast.error("Failed to load solutions");
    }
  };

  const handleSubmitSolution = async (challengeId: string) => {
    if (!user?.id) {
      toast.error("You must be logged in to submit a solution");
      return;
    }
    
    if (!newSolution.trim()) {
      toast.error("Solution cannot be empty");
      return;
    }

    setLoadingSolution(true);
    
    try {
      const solution = await createSolution(challengeId, newSolution, user.id);
      
      if (solution) {
        // Update the solutions list
        setSolutions(prev => {
          const updatedSolutions = prev[challengeId] ? [solution, ...prev[challengeId]] : [solution];
          return {
            ...prev,
            [challengeId]: updatedSolutions
          };
        });
        
        // Also update the challenge solutions count
        setChallenges(prev => 
          prev.map(challenge => 
            challenge.id === challengeId 
              ? { ...challenge, solutions_count: (challenge.solutions_count || 0) + 1 }
              : challenge
          )
        );
        
        setNewSolution("");
        setOpenPopover(null);
      }
    } finally {
      setLoadingSolution(false);
    }
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
        // Update solutions with new vote count
        setSolutions(prev => {
          const challengeSolutions = prev[challengeId] || [];
          
          return {
            ...prev,
            [challengeId]: challengeSolutions.map(solution => {
              if (solution.id === solutionId) {
                const currentVote = userVotes[solutionId];
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
                
                return {
                  ...solution,
                  votes: (solution.votes || 0) + voteChange
                };
              }
              return solution;
            })
          };
        });
        
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
        // Update challenges with new vote count
        setChallenges(prev => {
          return prev.map(challenge => {
            if (challenge.id === challengeId) {
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
              
              return {
                ...challenge,
                votes_count: (challenge.votes_count || 0) + voteChange
              };
            }
            return challenge;
          });
        });
        
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

  // Filtering and sorting challenges
  const getFilteredChallenges = () => {
    return challenges
      .filter(challenge => filterAgeGroup === "all" || challenge.age_group === filterAgeGroup)
      .filter(challenge => filterLocation === "all" || challenge.location === filterLocation)
      .filter(challenge => {
        if (selectedTags.length === 0) return true;
        return challenge.tags && selectedTags.some(tag => challenge.tags?.includes(tag));
      })
      .filter(challenge => 
        !searchTerm || 
        challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (challenge.tags && challenge.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      )
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else if (sortBy === "oldest") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        } else if (sortBy === "popular") {
          return (b.votes_count || 0) - (a.votes_count || 0);
        } else if (sortBy === "most_solutions") {
          return (b.solutions_count || 0) - (a.solutions_count || 0);
        }
        return 0;
      });
  };

  return {
    loading,
    filteredChallenges: getFilteredChallenges(),
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
    handleVote,
    openPopover,
    setOpenPopover,
    handleSubmitSolution,
    newSolution,
    setNewSolution,
    loadingSolution,
    user
  };
};
