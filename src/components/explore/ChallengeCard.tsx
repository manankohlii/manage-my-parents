
import React from "react";
import { formatDistanceToNow } from "date-fns";
import TagBadge from "../TagBadge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Challenge } from "@/services/challengesService";
import SolutionsList from "./SolutionsList";
import SolutionForm from "./SolutionForm";
import { Solution } from "@/services/solutionsService";

interface ChallengeCardProps {
  challenge: Challenge;
  handleUpvote: (challengeId: string) => void;
  handleDownvote: (challengeId: string) => void;
  handleSubmitSolution: (challengeId: string) => Promise<void>;
  newSolution: string;
  setNewSolution: (value: string) => void;
  loadingSolution: boolean;
  userVotes: Record<string, boolean | null>;
  openSolutionForm: string | null;
  setOpenSolutionForm: (isOpen: string | null) => void;
  user: any;
  solutions?: Record<string, Solution[]>;
  handleVote: (challengeId: string, solutionId: string, voteType: 'up' | 'down') => Promise<void>;
}

const ChallengeCard = ({
  challenge,
  handleUpvote,
  handleDownvote,
  handleSubmitSolution,
  newSolution,
  setNewSolution,
  loadingSolution,
  userVotes,
  openSolutionForm,
  setOpenSolutionForm,
  user,
  solutions,
  handleVote
}: ChallengeCardProps) => {
  const isUpvoted = userVotes[challenge.id] === true;
  const isDownvoted = userVotes[challenge.id] === false;
  const challengeSolutions = solutions?.[challenge.id] || [];

  const handleSolutionSubmit = async (solution: string) => {
    setNewSolution(solution);
    await handleSubmitSolution(challenge.id);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{challenge.title}</h3>
          <div className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(challenge.created_at), {
              addSuffix: true,
            })}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {challenge.tags?.map((tag) => (
            <TagBadge key={tag} text={tag} />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700">{challenge.description}</p>
        
        {/* Add the Solution Form */}
        <SolutionForm
          challengeId={challenge.id}
          onSubmit={(solution) => handleSolutionSubmit(solution)}
          loading={loadingSolution}
          user={user}
          solutions={challengeSolutions}
        />
      </CardContent>
      <SolutionsList 
        challengeId={challenge.id}
        solutions={challengeSolutions}
        handleVote={handleVote}
        userVotes={userVotes}
        user={user}
      />
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={() => handleUpvote(challenge.id)}
            className={isUpvoted ? "text-green-500" : ""}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            {challenge.votes_count > 0 ? challenge.votes_count : ''}
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleDownvote(challenge.id)}
            className={isDownvoted ? "text-red-500" : ""}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
             {challenge.votes_count < 0 ? Math.abs(challenge.votes_count) : ''}
          </Button>
        </div>
        <Button variant="ghost">
          <MessageCircle className="h-4 w-4 mr-1" />
          {challenge.solutions_count} Solutions
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ChallengeCard;
