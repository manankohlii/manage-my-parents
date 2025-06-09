import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import ChallengeCard from "@/components/explore/ChallengeCard";
import { Issue } from "./useIssues";
import { createGroupSolution, getGroupSolutions, GroupSolution } from '@/services/groupSolutionsService';
import { useAuth } from '@/contexts/AuthContext';

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
  const { toast } = useToast();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const { user } = useAuth();
  const [solutions, setSolutions] = useState<Record<string, GroupSolution[]>>({});
  const [loadingSolution, setLoadingSolution] = useState<Record<string, boolean>>({});
  const [issuesState, setIssuesState] = useState<Issue[]>(issues);

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

  const handleSubmitGroupSolution = async (challengeId: string, solutionText: string) => {
    if (!user?.id) {
      return;
    }
    if (!solutionText.trim()) {
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
        setIssuesState(prevIssues => prevIssues.map(issue =>
          issue.id === challengeId
            ? { ...issue, solutionCount: (issue.solutionCount || 0) + 1 }
            : issue
        ));
      }
    } catch (error) {
      // Optionally show a toast
    } finally {
      setLoadingSolution(prev => ({ ...prev, [challengeId]: false }));
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
          <div key={issue.id} style={{ cursor: 'pointer' }}>
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
              handleSubmitSolution={(challengeId, solutionText) => handleSubmitGroupSolution(challengeId, solutionText)}
              loadingSolution={!!loadingSolution[issue.id]}
              userVotes={{ [issue.id]: userVotes[issue.id] }}
              openSolutionForm={true}
              setOpenSolutionForm={() => {}}
              user={user}
              solutions={(solutions[issue.id] || []).map(gs => ({
                ...gs,
                challenge_id: gs.group_challenge_id,
              }))}
              handleVote={async () => {}}
            />
          </div>
        );
      })}
    </div>
  );
};

export default IssuesList;
