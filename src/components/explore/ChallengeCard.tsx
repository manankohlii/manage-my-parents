import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import TagBadge from "../TagBadge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ThumbsUp, MessageCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Challenge } from "@/services/challenges/types";
import SolutionsList from "./SolutionsList";
import { Solution } from "@/services/solutionsService";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

interface ChallengeCardProps {
  challenge: Challenge;
  handleUpvote: (challengeId: string) => void;
  handleDownvote: (challengeId: string) => void;
  handleSubmitSolution: (challengeId: string, solutionText: string) => Promise<void>;
  loadingSolution: boolean;
  userVotes: Record<string, boolean | null>;
  openSolutionForm: boolean;
  setOpenSolutionForm: (isOpen: boolean) => void;
  user: any;
  solutions?: Solution[];
  handleVote: (challengeId: string, solutionId: string | null, voteType: 'up' | 'down') => Promise<void>;
  onSolutionDeleted?: () => void;
  showSolutions?: boolean;
  onToggleSolutions?: () => void;
  solutionText?: string;
  onSolutionTextChange?: (text: string) => void;
  onSolutionSubmit?: () => void;
  solutionLoading?: boolean;
  SolutionsListComponent?: React.ComponentType<any>;
  solutionsListProps?: any;
  isGroupChallenge?: boolean;
  canEditOrDelete?: boolean;
  onEdit?: (challenge: Challenge) => void;
  onDelete?: (challenge: Challenge) => void;
  solutionsCount?: number;
}

const ChallengeCard = ({
  challenge,
  handleUpvote,
  handleDownvote,
  handleSubmitSolution,
  loadingSolution,
  userVotes,
  openSolutionForm,
  setOpenSolutionForm,
  user,
  solutions = [],
  handleVote,
  onSolutionDeleted,
  showSolutions: showSolutionsProp,
  onToggleSolutions,
  solutionText,
  onSolutionTextChange,
  onSolutionSubmit,
  solutionLoading,
  SolutionsListComponent,
  solutionsListProps,
  isGroupChallenge,
  canEditOrDelete,
  onEdit,
  onDelete,
  solutionsCount
}: ChallengeCardProps) => {
  const [showSolutionsState, setShowSolutionsState] = useState(false);
  const [localSolutionText, setLocalSolutionText] = useState("");
  const showSolutions = showSolutionsProp !== undefined ? showSolutionsProp : showSolutionsState;

  // If group challenge mode (SolutionsListComponent provided), use controlled props
  if (SolutionsListComponent) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold" onClick={() => {
              console.log('Challenge clicked:', challenge);
              if (user) {
                console.log('Current user:', user);
              }
            }}>{challenge.title}</h3>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(challenge.created_at), {
                  addSuffix: true,
                })}
              </div>
              {isGroupChallenge && canEditOrDelete && (
                <>
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(challenge)}
                      className="ml-2"
                      aria-label="Edit Challenge"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2"
                          aria-label="Delete Challenge"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to delete this challenge?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(challenge)} className="bg-red-500 hover:bg-red-600 text-white">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {challenge.tags?.map((tag) => (
              <TagBadge key={tag} text={tag} />
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            By {challenge.display_name || "Anonymous User"}
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
          
          <form onSubmit={e => { e.preventDefault(); onSolutionSubmit && onSolutionSubmit(); }} className="px-6 py-4 border-t">
            <h3 className="text-sm font-medium mb-2">Contribute a solution</h3>
            <textarea
              placeholder="Share your solution..."
              value={solutionText || ''}
              onChange={e => onSolutionTextChange && onSolutionTextChange(e.target.value)}
              className="min-h-[100px] mb-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={solutionLoading}
            />
            <Button
              type="submit"
              disabled={!solutionText?.trim() || solutionLoading}
              className="w-full sm:w-auto"
            >
              {solutionLoading ? 'Submitting...' : 'Submit Solution'}
            </Button>
          </form>
          
          {showSolutions && SolutionsListComponent && (
            <SolutionsListComponent {...solutionsListProps} />
          )}
        </CardContent>
        
        <CardFooter className="flex items-center justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              if (onToggleSolutions) {
                onToggleSolutions();
              } else {
                setShowSolutionsState((prev) => !prev);
              }
            }}
            className="flex items-center"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {isGroupChallenge && typeof solutionsCount === 'number'
              ? solutionsCount
              : challenge.solutions_count || 0} Solutions
            {showSolutions ? ' (Hide)' : ' (View)'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Default explore challenge mode: use internal state for form and toggling
  const [exploreShowSolutions, setExploreShowSolutions] = useState(false);
  const [exploreSolutionText, setExploreSolutionText] = useState("");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exploreSolutionText.trim()) return;
    await handleSubmitSolution(challenge.id, exploreSolutionText);
    setExploreSolutionText("");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold" onClick={() => {
            console.log('Challenge clicked:', challenge);
            if (user) {
              console.log('Current user:', user);
            }
          }}>{challenge.title}</h3>
          <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(challenge.created_at), {
              addSuffix: true,
            })}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {challenge.tags?.map((tag) => (
            <TagBadge key={tag} text={tag} />
          ))}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          By {challenge.display_name || "Anonymous User"}
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
        <form onSubmit={handleFormSubmit} className="px-6 py-4 border-t">
          <h3 className="text-sm font-medium mb-2">Contribute a solution</h3>
          <textarea
            placeholder="Share your solution..."
            value={exploreSolutionText}
            onChange={e => setExploreSolutionText(e.target.value)}
            className="min-h-[100px] mb-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loadingSolution}
          />
          <Button
            type="submit"
            disabled={!exploreSolutionText.trim() || loadingSolution}
            className="w-full sm:w-auto"
          >
            {loadingSolution ? 'Submitting...' : 'Submit Solution'}
          </Button>
        </form>
        {exploreShowSolutions && (
        <SolutionsList 
          challengeId={challenge.id}
          solutions={solutions || []}
          handleVote={handleVote}
          userVotes={userVotes}
          user={user}
            onSolutionDeleted={onSolutionDeleted}
        />
      )}
      </CardContent>
      <CardFooter className="flex items-center justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setExploreShowSolutions((prev) => !prev)}
          className="flex items-center"
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          {challenge.solutions_count || 0} Solutions
          {exploreShowSolutions ? ' (Hide)' : ' (View)'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ChallengeCard;
