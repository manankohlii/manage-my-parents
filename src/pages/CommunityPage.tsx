
import { useChallengeListing } from "@/hooks/explore/useChallengeListing";
import ChallengeCard from "@/components/explore/ChallengeCard";
import { Skeleton } from "@/components/ui/skeleton";

const CommunityPage = () => {
  const {
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
    solutions,
    userVotes,
    handleVote,
    openPopover,
    setOpenPopover,
    handleSubmitSolution,
    newSolution,
    setNewSolution,
    loadingSolution,
    user
  } = useChallengeListing();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Community Challenges</h1>
      
      {/* Search and Filters */}
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search challenges..."
          className="border p-2 rounded flex-grow md:flex-grow-0 md:w-1/3"
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
          <option value="most_solutions">Most Solutions</option>
        </select>
        
        {/* Age Group filter removed */}
        
        <select
          className="border p-2 rounded"
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
        >
          <option value="">All Locations</option>
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="UK">United Kingdom</option>
          <option value="AU">Australia</option>
        </select>
      </div>
      
      {/* Challenge cards rendering */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <Skeleton key={index} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredChallenges.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No challenges found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              handleUpvote={() => handleVote(challenge.id, null, 'up')} 
              handleDownvote={() => handleVote(challenge.id, null, 'down')}
              handleSubmitSolution={handleSubmitSolution}
              newSolution={newSolution}
              setNewSolution={setNewSolution}
              loadingSolution={loadingSolution}
              userVotes={userVotes}
              openSolutionForm={openPopover === challenge.id}
              setOpenSolutionForm={(isOpen) => setOpenPopover(isOpen ? challenge.id : null)}
              user={user}
              solutions={solutions[challenge.id] || []}
              handleVote={handleVote}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
