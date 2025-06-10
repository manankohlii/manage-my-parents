import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import ChallengeCard from "@/components/explore/ChallengeCard";
import { createGroupSolution, getGroupSolutions, GroupSolution, deleteGroupSolution } from '@/services/groupSolutionsService';
import { useAuth } from '@/contexts/AuthContext';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import GroupSolutionsList from "@/components/privateGroups/issues/GroupSolutionsList";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { deleteGroupChallenge } from "@/services/groupChallengesService";
import ChallengeForm from "@/components/challenges/ChallengeForm";
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
  onIssueDeleted?: (issueId: string) => void;
  updateIssue: (issueId: string, data: { title: string; description: string; tags: string[] }) => Promise<any>;
}

const IssuesList = ({
  issues,
  filteredIssues,
  loading,
  formatDate,
  onOpenAddDialog,
  onSelectIssue,
  userVotes,
  onVote,
  onIssueDeleted,
  updateIssue
}: IssuesListProps) => {
  const { toast: uiToast } = useToast();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const { user } = useAuth();
  const [solutions, setSolutions] = useState<Record<string, GroupSolution[]>>({});
  const [loadingSolution, setLoadingSolution] = useState<Record<string, boolean>>({});
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});
  const [newSolutions, setNewSolutions] = useState<Record<string, string>>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editChallenge, setEditChallenge] = useState<Issue | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', tags: '' });

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

  const handleEdit = (challenge: Issue) => {
    setEditChallenge(challenge);
    setEditForm({
      title: challenge.title,
      description: challenge.description,
      tags: (challenge.tags || []).join(', '),
    });
    setEditDialogOpen(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    if (!editChallenge) return;
    try {
      const updatedChallenge = await updateIssue(editChallenge.id, {
        title: editForm.title,
        description: editForm.description,
        tags: editForm.tags.split(',').map(t => t.trim()).filter(t => t),
      });
      
      setEditDialogOpen(false);
      setEditChallenge(null);
      toast.success("Challenge updated successfully");
    } catch (error) {
      console.error("Error saving edit:", error);
      toast.error("Failed to update challenge");
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    console.log("Attempting to delete challenge:", challengeId);
    try {
      const result = await deleteGroupChallenge(challengeId);
      console.log("Delete result:", result);
      
      // Also update the solutions state
      setSolutions(prev => {
        const newState = { ...prev };
        delete newState[challengeId];
        return newState;
      });

      // Update expanded solutions state
      setExpandedSolutions(prev => {
        const newState = { ...prev };
        delete newState[challengeId];
        return newState;
      });

      // Update new solutions state
      setNewSolutions(prev => {
        const newState = { ...prev };
        delete newState[challengeId];
        return newState;
      });

      // Notify parent component about the deletion
      onIssueDeleted?.(challengeId);

      toast.success("Challenge deleted successfully");
    } catch (error) {
      console.error("Error deleting challenge:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      toast.error("Failed to delete challenge");
    }
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
        editChallenge && editChallenge.id === issue.id ? (
          <ChallengeForm
            key={issue.id}
            challenge={editChallenge}
            onUpdate={async (id, data) => {
              await updateIssue(id, data);
              setEditChallenge(null);
            }}
            onClose={() => setEditChallenge(null)}
          />
        ) : (
          <ChallengeCard
            key={issue.id}
            challenge={issue as any}
            handleUpvote={() => onVote(issue.id, true)}
            handleDownvote={() => onVote(issue.id, false)}
            handleSubmitSolution={handleSubmitGroupSolution}
            loadingSolution={loadingSolution[issue.id] || false}
            userVotes={userVotes}
            openSolutionForm={false}
            setOpenSolutionForm={() => {}}
            user={user}
            solutions={(solutions[issue.id] || []) as any}
            handleVote={async () => {}}
            onSolutionDeleted={() => handleDeleteGroupSolution(issue.id, '')}
            showSolutions={expandedSolutions[issue.id]}
            onToggleSolutions={() => setExpandedSolutions(prev => ({
              ...prev,
              [issue.id]: !prev[issue.id]
            }))}
            solutionText={newSolutions[issue.id]}
            onSolutionTextChange={(text) => setNewSolutions(prev => ({
              ...prev,
              [issue.id]: text
            }))}
            onSolutionSubmit={() => handleSubmitGroupSolution(issue.id)}
            solutionLoading={loadingSolution[issue.id] || false}
            SolutionsListComponent={GroupSolutionsList}
            solutionsListProps={{
              solutions: solutions[issue.id] || [],
              onDelete: (solutionId: string) => handleDeleteGroupSolution(issue.id, solutionId),
              userVotes: userVotes,
              onVote: onVote,
              challengeId: issue.id
            }}
            isGroupChallenge={true}
            canEditOrDelete={issue.user_id === user?.id}
            onEdit={challenge => handleEdit((challenge as unknown) as Issue)}
            onDelete={challenge => handleDeleteChallenge(challenge.id)}
          />
        )
      ))}
    </div>
  );
};

export default IssuesList;
