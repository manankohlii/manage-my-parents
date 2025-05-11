
import { Card } from "@/components/ui/card";
import { Challenge } from "@/services/challenges";
import { useAuth } from "@/contexts/AuthContext";
import SolutionsList from "../explore/SolutionsList";
import { useChallengeCardSolutions } from "@/hooks/myChallenges/useChallengeCardSolutions";
import ChallengeCardHeader from "./ChallengeCardHeader";
import ChallengeCardContent from "./ChallengeCardContent";
import ChallengeCardFooter from "./ChallengeCardFooter";

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
    loading,
    userVotes,
    handleViewSolutions,
    handleVote
  } = useChallengeCardSolutions(challenge.id, user?.id);

  return (
    <Card key={challenge.id} className="w-full">
      <ChallengeCardHeader 
        title={challenge.title}
        onEdit={() => onEdit(challenge.id)}
        onDelete={() => onDelete(challenge.id)}
      />
      
      <ChallengeCardContent
        description={challenge.description}
        tags={challenge.tags}
        location={challenge.location}
        mood={challenge.mood}
      />
      
      {showSolutions && (
        <SolutionsList 
          challengeId={challenge.id}
          solutions={solutions}
          handleVote={handleVote}
          userVotes={userVotes}
          user={user}
        />
      )}
      
      <ChallengeCardFooter 
        createdAt={challenge.created_at}
        solutionsCount={challenge.solutions_count || 0}
        isLoadingSolutions={loading}
        showingSolutions={showSolutions}
        onViewSolutions={handleViewSolutions}
      />
    </Card>
  );
};

export default ChallengeCard;
