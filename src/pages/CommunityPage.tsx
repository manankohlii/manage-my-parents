import { useState, useEffect } from "react";
import { getAllChallenges, Challenge } from "@/services/challenges";
import ChallengeCard from "@/components/explore/ChallengeCard";
import { useAuth } from "@/contexts/AuthContext";
import { useVoting } from "@/hooks/explore/useVoting";
import { useSolutions } from "@/hooks/explore/useSolutions";
import { useFiltering } from "@/hooks/explore/useFiltering";
import { toast } from "sonner";

const CommunityPage = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  
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
  
  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      try {
        const fetchedChallenges = await getAllChallenges();
        setChallenges(fetchedChallenges);
        
        // Pre-load solutions for challenges with solutions_count > 0
        fetchedChallenges.forEach(challenge => {
          if ((challenge.solutions_count || 0) > 0) {
            loadSolutions(challenge.id);
          }
        });
        
        if (user?.id) {
          loadUserVotesForChallenges(fetchedChallenges);
        }
      } catch (error) {
        console.error("Error fetching challenges:", error);
        toast.error("Failed to load challenges");
      } finally {
        setLoading(false);
      }
    };
    
    fetchChallenges();
  }, [loadSolutions, loadUserVotesForChallenges, user?.id]);

  const handleSolutionSubmit = async (challengeId: string) => {
    await handleSubmitSolution(challengeId);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Community Challenges</h1>
      
      {/* Search and Filters */}
      <div className="mb-4 flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search challenges..."
          className="border p-2 rounded w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select
          className="border p-2 rounded"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          {/* Add more sorting options here */}
        </select>
        
        <select
          className="border p-2 rounded"
          value={filterAgeGroup}
          onChange={(e) => setFilterAgeGroup(e.target.value)}
        >
          <option value="">All Ages</option>
          <option value="0-12">0-12</option>
          <option value="13-18">13-18</option>
          <option value="19+">19+</option>
        </select>
        
        <select
          className="border p-2 rounded"
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
        >
          <option value="">All Locations</option>
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          {/* Add more location options here */}
        </select>
      </div>
      
      {loading ? (
        <p>Loading challenges...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredChallenges(challenges).map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              handleUpvote={() => {}} // Implement upvote logic
              handleDownvote={() => {}} // Implement downvote logic
              handleSubmitSolution={handleSolutionSubmit}
              newSolution={newSolution}
              setNewSolution={setNewSolution}
              loadingSolution={loadingSolution}
              userVotes={userVotes}
              openSolutionForm={openPopover}
              setOpenSolutionForm={setOpenPopover}
              user={user}
              solutions={solutions}
              handleVote={handleVote}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
