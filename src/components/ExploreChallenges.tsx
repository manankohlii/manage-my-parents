
import { Card, CardContent } from "@/components/ui/card";
import ChallengeFilters from "./explore/ChallengeFilters";
import ChallengeCard from "./explore/ChallengeCard";
import { useChallengeListing } from "./explore/useChallengeListing";

const ExploreChallenges = () => {
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
  } = useChallengeListing();

  return (
    <div className="space-y-6">
      <ChallengeFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterAgeGroup={filterAgeGroup}
        setFilterAgeGroup={setFilterAgeGroup}
        filterLocation={filterLocation}
        setFilterLocation={setFilterLocation}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        allTags={allTags}
      />

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-pulse">Loading challenges...</div>
        </div>
      ) : filteredChallenges.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <p className="text-muted-foreground">
              No challenges match your search criteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              handleVote={handleVote}
              userVotes={userVotes}
              loadSolutions={loadSolutions}
              solutions={solutions}
              user={user}
              openPopover={openPopover}
              setOpenPopover={setOpenPopover}
              handleSubmitSolution={handleSubmitSolution}
              newSolution={newSolution}
              setNewSolution={setNewSolution}
              loadingSolution={loadingSolution}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreChallenges;
