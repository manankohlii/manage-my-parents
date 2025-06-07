import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import ChallengeCard from "@/components/explore/ChallengeCard";
import { Issue } from "./useIssues";

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

  const handleIssueClick = (issue: Issue) => {
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
      {filteredIssues.map((issue) => (
        <ChallengeCard
          key={issue.id}
          challenge={{
            ...issue,
            likes_count: issue.votes || 0,
            solutions_count: issue.solutionCount || 0,
            created_at: issue.created_at,
            tags: issue.tags,
            mood: '',
            location: '',
            age_group: '',
          }}
          handleUpvote={() => onVote(issue.id, true)}
          handleDownvote={() => {}}
          handleSubmitSolution={async () => {}}
          loadingSolution={false}
          userVotes={{ [issue.id]: userVotes[issue.id] }}
          openSolutionForm={false}
          setOpenSolutionForm={() => {}}
          user={null}
          solutions={[]}
          handleVote={async () => {}}
        />
      ))}
    </div>
  );
};

export default IssuesList;
