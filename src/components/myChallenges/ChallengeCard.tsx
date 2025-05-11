
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
import { Challenge } from "@/services/challenges";
import { useState, useEffect } from "react";
import { Solution, getSolutions, voteSolution, createSolution } from "@/services/solutionsService";
import SolutionsList from "../explore/SolutionsList";
import SolutionForm from "../explore/SolutionForm";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ChallengeCardProps {
  challenge: Challenge;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const ChallengeCard = ({ challenge, onDelete, onEdit }: ChallengeCardProps) => {
  const [showSolutions, setShowSolutions] = useState(false);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);
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
      
      // Initialize user votes state
      if (user) {
        const initialUserVotes: Record<string, boolean | null> = {};
        fetchedSolutions.forEach(solution => {
          // For simplicity, we'll just use the presence of upvote/downvote markers in the data
          // In a real app, you would fetch actual user votes from a separate API call
          initialUserVotes[solution.id] = null;
        });
        setUserVotes(initialUserVotes);
      }
      
      setShowSolutions(true);
    } catch (error) {
      console.error("Failed to fetch solutions:", error);
      toast.error("Failed to load solutions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSolution = async (solutionText: string): Promise<void> => {
    if (!user) {
      toast.error("You must be logged in to submit solutions");
      return;
    }
    
    setSubmittingForm(true);
    try {
      const newSolution = await createSolution(challenge.id, solutionText, user.id);
      if (newSolution) {
        // Add the new solution to the list
        setSolutions([newSolution, ...solutions]);
        
        // Update challenge's solution count in parent component if needed
        // This would require passing a callback from the parent
      }
    } catch (error) {
      console.error("Failed to submit solution:", error);
      toast.error("Failed to submit solution");
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleVote = async (challengeId: string, solutionId: string, voteType: 'up' | 'down') => {
    if (!user) {
      toast.error("You must be logged in to vote");
      return;
    }

    try {
      // Determine if this is an upvote (true) or downvote (false)
      const isUpvote = voteType === 'up';
      
      // If user already voted the same way, consider it a vote removal
      const isRemovingVote = userVotes[solutionId] === isUpvote;
      
      // Update optimistic UI first
      setUserVotes(prev => ({
        ...prev,
        [solutionId]: isRemovingVote ? null : isUpvote
      }));
      
      // Update the solution in the database
      await voteSolution(solutionId, user.id, isRemovingVote ? null : isUpvote);
      
      // Refresh solutions to get updated vote counts
      const updatedSolutions = await getSolutions(challengeId);
      setSolutions(updatedSolutions);
    } catch (error) {
      console.error("Failed to register vote:", error);
      toast.error("Failed to register your vote");
      
      // Revert optimistic UI update on error
      setUserVotes(prev => ({
        ...prev,
        [solutionId]: prev[solutionId]
      }));
    }
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
            <span>Location: {challenge.location}</span>
            <span>Mood: {challenge.mood}</span>
          </div>
        </div>
      </CardContent>
      
      {showSolutions && (
        <>
          <SolutionsList 
            challengeId={challenge.id}
            solutions={solutions}
            handleVote={handleVote}
            userVotes={userVotes}
            user={user}
          />
          
          <SolutionForm
            challengeId={challenge.id}
            onSubmit={handleSubmitSolution}
            loading={submittingForm}
            user={user}
            solutions={solutions}
          />
        </>
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
