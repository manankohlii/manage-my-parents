import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import TagBadge from "../TagBadge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MessageCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Challenge } from "@/services/challenges/types";
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
  openSolutionForm: boolean;
  setOpenSolutionForm: (isOpen: boolean) => void;
  user: any;
  solutions?: Solution[];
  handleVote: (challengeId: string, solutionId: string | null, voteType: 'up' | 'down') => Promise<void>;
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
  solutions = [],
  handleVote
}: ChallengeCardProps) => {
  const [showSolutions, setShowSolutions] = useState(false);
  
  const handleSolutionSubmit = async (solution: string) => {
    setNewSolution(solution);
    await handleSubmitSolution(challenge.id);
  };

  const toggleSolutions = () => {
    setShowSolutions(!showSolutions);
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
        <p className="text-sm text-gray-700 mb-4">{challenge.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleUpvote(challenge.id)}
              disabled={!user}
              className="flex items-center"
            >
              <ThumbsUp className={`h-4 w-4 mr-1 ${userVotes[challenge.id] === true ? "text-primary fill-primary" : ""}`} />
              <span>{challenge.likes_count || 0}</span>
            </Button>
          </div>
        </div>
        
        {/* Add the Solution Form */}
        <SolutionForm
          challengeId={challenge.id}
          onSubmit={(solution) => handleSolutionSubmit(solution)}
          loading={loadingSolution}
          user={user}
          solutions={solutions || []}
        />
      </CardContent>
      
      {/* Only show solutions if expanded */}
      {showSolutions && (
        <SolutionsList 
          challengeId={challenge.id}
          solutions={solutions || []}
          handleVote={handleVote}
          userVotes={userVotes}
          user={user}
        />
      )}
      
      <CardFooter className="flex items-center justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleSolutions}
          className="flex items-center"
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          {challenge.solutions_count || 0} Solutions
          {showSolutions ? ' (Hide)' : ' (View)'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ChallengeCard;
