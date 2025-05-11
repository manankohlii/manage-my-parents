
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import TagBadge from "../TagBadge";
import { Challenge } from "@/services/challengesService";
import { useState } from "react";
import { Solution } from "@/services/solutionsService";
import { getSolutions } from "@/services/solutionsService";
import SolutionsList from "../explore/SolutionsList";
import { useAuth } from "@/contexts/AuthContext";

interface ChallengeCardProps {
  challenge: Challenge;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const ChallengeCard = ({ challenge, onDelete, onEdit }: ChallengeCardProps) => {
  const [showSolutions, setShowSolutions] = useState(false);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [userVotes, setUserVotes] = useState<Record<string, boolean | null>>({});

  const handleViewSolutions = async () => {
    if (showSolutions) {
      // Just toggle off if already showing
      setShowSolutions(false);
      return;
    }

    setLoading(true);
    try {
      const fetchedSolutions = await getSolutions(challenge.id);
      setSolutions(fetchedSolutions);
      setShowSolutions(true);
    } catch (error) {
      console.error("Failed to fetch solutions:", error);
    } finally {
      setLoading(false);
    }
  };

  // This is a placeholder - in a real app, you would implement this properly
  const handleVote = async (challengeId: string, solutionId: string, voteType: 'up' | 'down') => {
    console.log(`Vote ${voteType} for solution ${solutionId}`);
    // Here you would call your API to register the vote
    // and then update the solutions state
  };

  return (
    <Card key={challenge.id} className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{challenge.title}</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEdit(challenge.id)}
            >
              <Edit size={18} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDelete(challenge.id)}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-3">{challenge.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {challenge.tags && challenge.tags.map((tag) => (
            <TagBadge key={tag} text={tag} />
          ))}
        </div>
        
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Age Group: {challenge.age_group}</span>
            <span>Location: {challenge.location}</span>
            <span>Mood: {challenge.mood}</span>
          </div>
        </div>
      </CardContent>
      
      {showSolutions && (
        <SolutionsList 
          challengeId={challenge.id}
          solutions={solutions}
          handleVote={handleVote}
          userVotes={userVotes}
          user={user}
        />
      )}
      
      <CardFooter className="border-t pt-4 flex justify-between">
        <span className="text-sm text-muted-foreground">
          Posted on {new Date(challenge.created_at).toLocaleDateString()}
        </span>
        <Button 
          variant="link" 
          className="px-0" 
          onClick={handleViewSolutions}
          disabled={loading}
        >
          {loading ? "Loading..." : showSolutions 
            ? "Hide solutions" 
            : `View ${challenge.solutions_count || 0} solutions`}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ChallengeCard;
