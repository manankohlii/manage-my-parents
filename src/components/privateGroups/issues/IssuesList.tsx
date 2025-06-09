import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import ChallengeCard from "@/components/explore/ChallengeCard";
import { Issue } from "./useIssues";
import { createGroupSolution, getGroupSolutions, GroupSolution, deleteGroupSolution } from '@/services/groupSolutionsService';
import { useAuth } from '@/contexts/AuthContext';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import GroupSolutionsList from "@/components/privateGroups/issues/GroupSolutionsList";

interface IssuesListProps {
  issues: Issue[];
  filteredIssues: Issue[];
  loading: boolean;
  formatDate: (dateString: string) => string;
  onOpenAddDialog: () => void;
  onSelectIssue: (issueId: string) => void;
  userVotes: Record<string, boolean>;
  onVote: (itemId: string, isUpvote: boolean) => void;
}

const IssuesList = ({
  issues,
  filteredIssues,
  loading,
  formatDate,
  onOpenAddDialog,
  onSelectIssue,
  userVotes,
  onVote
}: IssuesListProps) => {
  const { toast: uiToast } = useToast();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const { user } = useAuth();
  const [solutions, setSolutions] = useState<Record<string, GroupSolution[]>>({});
  const [loadingSolution, setLoadingSolution] = useState<Record<string, boolean>>({});
  const [issuesState, setIssuesState] = useState<Issue[]>(issues);
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});
  const [newSolutions, setNewSolutions] = useState<Record<string, string>>({});

  // Load solutions for all visible issues on mount or when filteredIssues changes
  useEffect(() => {
    const loadAllSolutions = async () => {
      const newSolutions: Record<string, GroupSolution[]> = {};
      for (const issue of filteredIssues) {
        try {
          const sols = await getGroupSolutions(issue.id);
          newSolutions[issue.id] = sols;
        } catch {
          newSolutions[issue.id] = [];
        }
      }
      setSolutions(newSolutions);
    };
    loadAllSolutions();
  }, [filteredIssues]);

  useEffect(() => {
    setIssuesState(issues);
  }, [issues]);

  const handleSubmitGroupSolution = async (challengeId: string) => {
    if (!user?.id) {
      toast.error("You must be logged in to submit a solution");
      return;
    }
    const solutionText = newSolutions[challengeId];
    if (!solutionText?.trim()) {
      toast.error("Solution cannot be empty");
      return;
    }
    setLoadingSolution(prev => ({ ...prev, [challengeId]: true }));
    try {
      const solution = await createGroupSolution(challengeId, user.id, solutionText.trim());
      if (solution) {
        setSolutions(prev => ({
          ...prev,
          [challengeId]: [solution, ...(prev[challengeId] || [])]
        }));
        setNewSolutions(prev => {
          const newState = { ...prev };
          delete newState[challengeId];
          return newState;
        });
        setIssuesState(prevIssues => prevIssues.map(issue =>
          issue.id === challengeId
            ? { ...issue, solutionCount: (issue.solutionCount || 0) + 1 }
            : issue
        ));
        toast.success("Solution submitted successfully!");
      }
    } catch (error) {
      console.error("Error submitting solution:", error);
      toast.error("Failed to submit solution");
    } finally {
      setLoadingSolution(prev => ({ ...prev, [challengeId]: false }));
    }
  };

  const handleDeleteGroupSolution = async (challengeId: string, solutionId: string) => {
    console.log("handleDeleteGroupSolution called", { challengeId, solutionId });
    try {
      await deleteGroupSolution(solutionId);
      setSolutions(prev => ({
        ...prev,
        [challengeId]: (prev[challengeId] || []).filter(sol => sol.id !== solutionId)
      }));
      setIssuesState(prevIssues => prevIssues.map(issue =>
        issue.id === challengeId
          ? { ...issue, solutionCount: Math.max((issue.solutionCount || 1) - 1, 0) }
          : issue
      ));
      toast.success("Solution deleted successfully!");
    } catch (error) {
      console.error("Error deleting group solution:", error);
      toast.error("Failed to delete solution");
    }
  };

  const handleIssueClick = (issue: Issue) => {
    console.log("Challenge card clicked:", issue);
    setSelectedIssue(issue);
    onSelectIssue(issue.id);
  };

  if (loading) {
    return <div>Loading challenges...</div>;
  }

  if (issues.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          No challenges posted yet. Be the first to share a challenge!
          </p>
        <button className="btn" onClick={onOpenAddDialog}>
          Share Your First Challenge
        </button>
      </div>
    );
  }

  if (filteredIssues.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No challenges match your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredIssues.map((issue) => {
        const issueWithUpdatedCount = issuesState.find(i => i.id === issue.id) || issue;
        return (
          <div key={issue.id} className="space-y-4">
            <ChallengeCard
              challenge={{
                ...issueWithUpdatedCount,
                likes_count: issueWithUpdatedCount.votes || 0,
                solutions_count: (solutions[issue.id]?.length) ?? issueWithUpdatedCount.solutionCount ?? 0,
                created_at: issueWithUpdatedCount.created_at,
                tags: issueWithUpdatedCount.tags,
                mood: '',
                location: '',
                age_group: '',
              }}
              handleUpvote={() => onVote(issue.id, true)}
              handleDownvote={() => {}}
              handleVote={async (challengeId, solutionId, voteType) => {
                if (!solutionId) {
                  onVote(challengeId, voteType === 'up');
                }
                return Promise.resolve();
              }}
              loadingSolution={!!loadingSolution[issue.id]}
              userVotes={{ [issue.id]: userVotes[issue.id] }}
              openSolutionForm={false}
              setOpenSolutionForm={() => {}}
              user={user}
              handleSubmitSolution={async (challengeId, solutionText) => {
                await handleSubmitGroupSolution(challengeId);
                return Promise.resolve();
              }}
              showSolutions={!!expandedSolutions[issue.id]}
              onToggleSolutions={() => setExpandedSolutions(prev => ({ ...prev, [issue.id]: !prev[issue.id] }))}
              solutionText={newSolutions[issue.id] || ''}
              onSolutionTextChange={text => setNewSolutions(prev => ({ ...prev, [issue.id]: text }))}
              onSolutionSubmit={() => handleSubmitGroupSolution(issue.id)}
              solutionLoading={!!loadingSolution[issue.id]}
              SolutionsListComponent={GroupSolutionsList}
              solutionsListProps={{
                solutions: solutions[issue.id] || [],
                challengeId: issue.id,
                user: user,
                onDelete: (solutionId: string) => handleDeleteGroupSolution(issue.id, solutionId)
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default IssuesList;
