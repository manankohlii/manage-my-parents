
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import TagBadge from "../TagBadge";
import { Challenge } from "@/services/challengesService";
import { Solution } from "@/services/solutionsService";
import SolutionsList from "./SolutionsList";
import NewSolutionForm from "./NewSolutionForm";

interface ChallengeCardProps {
  challenge: Challenge;
  handleVote: (challengeId: string, solutionId: string | null, voteType: 'up' | 'down') => Promise<void>;
  userVotes: Record<string, boolean | null>;
  loadSolutions: (challengeId: string) => Promise<void>;
  solutions: Record<string, Solution[]>;
  user: any;
  openPopover: string | null;
  setOpenPopover: (value: string | null) => void;
  handleSubmitSolution: (challengeId: string) => Promise<void>;
  newSolution: string;
  setNewSolution: (value: string) => void;
  loadingSolution: boolean;
}

const ChallengeCard = ({
  challenge,
  handleVote,
  userVotes,
  loadSolutions,
  solutions,
  user,
  openPopover,
  setOpenPopover,
  handleSubmitSolution,
  newSolution,
  setNewSolution,
  loadingSolution
}: ChallengeCardProps) => {
  return (
    <Card key={challenge.id} className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{challenge.title}</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleVote(challenge.id, null, 'up')}
              className={userVotes[challenge.id] === true ? "text-primary" : ""}
            >
              <ThumbsUp 
                size={18} 
                className={userVotes[challenge.id] === true ? "text-green-500 fill-green-500" : ""} 
              />
            </Button>
            <span className="font-medium">{challenge.votes_count || 0}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleVote(challenge.id, null, 'down')}
              className={userVotes[challenge.id] === false ? "text-primary" : ""}
            >
              <ThumbsDown 
                size={18} 
                className={userVotes[challenge.id] === false ? "text-red-500 fill-red-500" : ""} 
              />
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Posted on {new Date(challenge.created_at).toLocaleDateString()}
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
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <span>Age Group: {challenge.age_group}</span>
            <span>Location: {challenge.location}</span>
            <span>Mood: {challenge.mood}</span>
          </div>
        </div>
        
        {/* Solutions Section - Only load when requested */}
        <Button 
          variant="link" 
          className="p-0 mt-3"
          onClick={() => loadSolutions(challenge.id)}
        >
          {challenge.solutions_count 
            ? `View ${challenge.solutions_count} solutions`
            : "No solutions yet - be the first to help!"}
        </Button>
        
        {solutions[challenge.id] && (
          <SolutionsList 
            solutions={solutions[challenge.id]}
            challengeId={challenge.id}
            handleVote={handleVote}
            userVotes={userVotes}
            user={user}
          />
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <NewSolutionForm 
          challengeId={challenge.id}
          isOpen={openPopover === challenge.id}
          setIsOpen={setOpenPopover}
          handleSubmitSolution={handleSubmitSolution}
          newSolution={newSolution}
          setNewSolution={setNewSolution}
          loadingSolution={loadingSolution}
          user={user}
        />
      </CardFooter>
    </Card>
  );
};

export default ChallengeCard;
