import { useContext, useState, useRef, useEffect } from "react";
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
import { Challenge } from "@/services/challenges";

const MyChallenges = () => {
  const tabContext = useContext(TabContext);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const {
    loading,
    filteredChallenges,
    challenges,
    sortBy,
    setSortBy,
    searchTerm,
    setSearchTerm,
    handleDeleteChallenge,
    handleUpdateChallenge,
    handleAddChallenge
  } = useChallenges();

  // Scroll to form when editing or adding
  useEffect(() => {
    if ((showAddForm || editingChallenge) && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showAddForm, editingChallenge]);

  const handleEditChallenge = (id: string) => {
    const challenge = challenges.find(c => c.id === id);
    if (challenge) {
      setEditingChallenge(challenge);
      setShowAddForm(false);
      // Scroll to form after a short delay to ensure state is updated
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const handleFormSubmit = () => {
    setShowAddForm(false);
    setEditingChallenge(null);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setEditingChallenge(null);
  };

  const handleAddNew = () => {
    setShowAddForm(true);
    setEditingChallenge(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">My Challenges</h3>
        <Button 
          onClick={handleAddNew}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add New Challenge
        </Button>
      </div>

      {(showAddForm || editingChallenge) && (
        <Card ref={formRef} className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <ChallengeForm 
              onSubmit={handleFormSubmit} 
              onClose={handleFormClose}
              challenge={editingChallenge}
              onUpdate={handleUpdateChallenge}
              onSubmitChallenge={handleAddChallenge}
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
          onCreateChallenge={handleAddNew}
        />
      ) : (
        <div className="space-y-4">
          {filteredChallenges
            .filter(challenge => !editingChallenge || challenge.id !== editingChallenge.id)
            .map((challenge) => (
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
