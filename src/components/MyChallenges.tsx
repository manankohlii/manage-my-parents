
import { useContext } from "react";
import { TabContext } from "./DashboardTabs";
import ChallengeFilters from "./myChallenges/ChallengeFilters";
import ChallengeCard from "./myChallenges/ChallengeCard";
import EmptyChallenges from "./myChallenges/EmptyChallenges";
import LoadingState from "./myChallenges/LoadingState";
import { useChallenges } from "./myChallenges/useChallenges";

const MyChallenges = () => {
  const tabContext = useContext(TabContext);
  const {
    loading,
    filteredChallenges,
    challenges,
    sortBy,
    setSortBy,
    filterAgeGroup,
    setFilterAgeGroup,
    filterCountry,
    setFilterCountry,
    searchTerm,
    setSearchTerm,
    handleDeleteChallenge
  } = useChallenges();

  const handleEditChallenge = (id: string) => {
    // Navigate to edit challenge page or open a modal
    console.log(`Edit challenge ${id}`);
  };

  const navigateToAddChallenge = () => {
    // Use the context to navigate to add-challenge tab
    if (tabContext && tabContext.setActiveTab) {
      tabContext.setActiveTab("add-challenge");
    }
  };

  return (
    <div className="space-y-6">
      <ChallengeFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterAgeGroup={filterAgeGroup}
        setFilterAgeGroup={setFilterAgeGroup}
        filterCountry={filterCountry}
        setFilterCountry={setFilterCountry}
      />

      {loading ? (
        <LoadingState />
      ) : filteredChallenges.length === 0 ? (
        <EmptyChallenges 
          hasChallenges={challenges.length > 0}
          onCreateChallenge={navigateToAddChallenge}
        />
      ) : (
        <div className="space-y-4">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard 
              key={challenge.id}
              challenge={challenge}
              onDelete={handleDeleteChallenge}
              onEdit={handleEditChallenge}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyChallenges;
