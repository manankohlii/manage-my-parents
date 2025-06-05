import { useContext, useState } from "react";
import { TabContext } from "./DashboardTabs";
import ChallengeFilters from "./myChallenges/ChallengeFilters";
import ChallengeCard from "./myChallenges/ChallengeCard";
import EmptyChallenges from "./myChallenges/EmptyChallenges";
import LoadingState from "./myChallenges/LoadingState";
import { useChallenges } from "./myChallenges/useChallenges";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ChallengeForm from "./challenges/ChallengeForm";

const MyChallenges = () => {
  const tabContext = useContext(TabContext);
  const [showAddForm, setShowAddForm] = useState(false);
  const {
    loading,
    filteredChallenges,
    challenges,
    sortBy,
    setSortBy,
    searchTerm,
    setSearchTerm,
    handleDeleteChallenge
  } = useChallenges();

  const handleEditChallenge = (id: string) => {
    // Navigate to edit challenge page or open a modal
    console.log(`Edit challenge ${id}`);
  };

  const handleFormSubmit = () => {
    setShowAddForm(false);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">My Challenges</h3>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add New Challenge
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardContent className="pt-6">
            <ChallengeForm 
              onSubmit={handleFormSubmit} 
              onClose={handleFormClose}
            />
          </CardContent>
        </Card>
      )}

      <ChallengeFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {loading ? (
        <LoadingState />
      ) : filteredChallenges.length === 0 ? (
        <EmptyChallenges 
          hasChallenges={challenges.length > 0}
          onCreateChallenge={() => setShowAddForm(true)}
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
