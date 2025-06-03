
import { useContext, useState } from "react";
import { TabContext } from "./DashboardTabs";
import ChallengeFilters from "./myChallenges/ChallengeFilters";
import ChallengeCard from "./myChallenges/ChallengeCard";
import EmptyChallenges from "./myChallenges/EmptyChallenges";
import LoadingState from "./myChallenges/LoadingState";
import { useChallenges } from "./myChallenges/useChallenges";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add New Challenge</h3>
          <Button 
            variant="outline" 
            onClick={() => setShowAddForm(false)}
            className="flex items-center gap-2"
          >
            <X size={16} />
            Back to My Challenges
          </Button>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Share Your Challenge</CardTitle>
            <CardDescription>
              Describe a challenge you're facing with caring for your parents.
              The community will share solutions and advice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChallengeForm />
          </CardContent>
        </Card>
      </div>
    );
  }

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

      <ChallengeFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterCountry={filterCountry}
        setFilterCountry={setFilterCountry}
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
