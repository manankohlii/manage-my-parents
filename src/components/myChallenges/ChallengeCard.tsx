import { Card } from "@/components/ui/card";
import { Challenge } from "@/services/challenges";
import { useAuth } from "@/contexts/AuthContext";
import SolutionsList from "../explore/SolutionsList";
import { useChallengeCardSolutions } from "@/hooks/myChallenges/useChallengeCardSolutions";
import ChallengeCardHeader from "./ChallengeCardHeader";
import ChallengeCardContent from "./ChallengeCardContent";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { createSolution } from "@/services/solutionsService";

interface ChallengeCardProps {
  challenge: Challenge;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const ChallengeCard = ({ challenge, onDelete, onEdit }: ChallengeCardProps) => {
  const { user } = useAuth();
  const {
    showSolutions,
    solutions,
    setSolutions,
    loading,
    userVotes,
    handleViewSolutions,
    handleVote
  } = useChallengeCardSolutions(challenge.id, user?.id);

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(challenge.id);
  };

  // Solution input form state
  const [solutionText, setSolutionText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solutionText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const newSolution = await createSolution(challenge.id, solutionText.trim(), user.id);
      if (newSolution) {
        setSolutionText("");
        if (!showSolutions) {
          await handleViewSolutions();
        } else {
          setSolutions(prev => [newSolution, ...prev]);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card key={challenge.id} className="w-full">
      <ChallengeCardHeader 
        title={challenge.title}
        onEdit={handleEdit}
        onDelete={() => onDelete(challenge.id)}
      />
      
      <ChallengeCardContent
        description={challenge.description}
        tags={challenge.tags}
        location={challenge.location}
      />

      {/* Solution input form */}
      <form onSubmit={handleSubmitSolution} className="px-6 py-4 ml-4">
        <h3 className="text-sm font-medium mb-2">Contribute a solution</h3>
        <textarea
          placeholder="Share your solution..."
          value={solutionText}
          onChange={e => setSolutionText(e.target.value)}
          className="min-h-[100px] mb-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={submitting}
        />
        <Button
          type="submit"
          disabled={!solutionText.trim() || submitting}
          className="w-full sm:w-auto"
        >
          {submitting ? 'Submitting...' : 'Submit Solution'}
        </Button>
      </form>
      
      {showSolutions && (
        <SolutionsList 
          challengeId={challenge.id}
          solutions={solutions}
          handleVote={handleVote}
          userVotes={userVotes}
          user={user}
        />
      )}
      
      <div className="flex items-center justify-end pt-4 pb-4 px-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleViewSolutions}
          disabled={loading}
          className="flex items-center"
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          {loading ? "Loading..." : showSolutions ? "Hide solutions" : `${challenge.solutions_count || 0} solutions (view)`}
        </Button>
      </div>
    </Card>
  );
};

export default ChallengeCard;
