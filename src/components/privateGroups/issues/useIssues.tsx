import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getGroupChallenges, createGroupChallenge, GroupChallenge, deleteGroupChallenge, updateGroupChallenge, voteGroupChallenge } from "@/services/groupChallengesService";

export interface Issue extends GroupChallenge {
  userName?: string;
  solutionCount?: number;
  votes?: number;
  location?: string;
}

export interface IssueSolution {
  id: string;
  issueId: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: string;
  votes: number;
}

export const useIssues = (groupId: string) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [solutions, setSolutions] = useState<Record<string, IssueSolution[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<string>("");
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({});
  
  const { user } = useAuth();
  const { toast: uiToast } = useToast();

  useEffect(() => {
    const loadIssues = async () => {
      try {
        setLoading(true);
        const data = await getGroupChallenges(groupId, user?.id);
        setIssues(data.map(challenge => ({ ...challenge, location: "" })));
        setSolutions({}); // TODO: fetch solutions if needed
        setUserVotes({});
      } catch (error) {
        console.error("Error loading group challenges:", error);
        uiToast({
          title: "Error loading challenges",
          description: "Could not load the challenges. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadIssues();
  }, [groupId, uiToast, user?.id]);

  // Filter issues based on search term and selected tag
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !filterTag || (issue.tags && issue.tags.includes(filterTag));
    return matchesSearch && matchesTag;
  });

  // Get all unique tags from issues
  const allTags = Array.from(new Set(issues.flatMap(issue => issue.tags || [])));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Add a new group challenge
  const addIssue = useCallback(async (challengeData: { title: string; description: string; tags: string[] }) => {
    if (!user) return;
    try {
      const newChallenge = await createGroupChallenge(groupId, user.id, challengeData);
      setIssues(prev => [newChallenge, ...prev]);
      toast.success("Challenge added to group!");
    } catch (error) {
      toast.error("Failed to add challenge to group");
    }
  }, [groupId, user]);

  const selectIssue = useCallback((issueId: string) => {
    setSelectedIssue(issueId);
  }, []);

  const getIssueSolutions = useCallback((issueId: string) => {
    return solutions[issueId] || [];
  }, [solutions]);

  const addSolution = useCallback((issueId: string, solution: IssueSolution) => {
    setSolutions(prev => ({
      ...prev,
      [issueId]: [...(prev[issueId] || []), solution]
    }));
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        return {
          ...issue,
          solutionCount: (issue.solutionCount || 0) + 1
        };
      }
      return issue;
    }));
  }, []);

  // Handle voting for issue or solution
  const handleVote = useCallback(async (itemId: string, isUpvote: boolean) => {
    if (!user) {
      toast.error("Please log in to vote");
      return;
    }
    // Optimistically update UI
    setIssues(prev => prev.map(issue => {
      if (issue.id !== itemId) return issue;
      const currentVote = issue.user_vote;
      let newLikes = typeof issue.likes_count === 'number' ? issue.likes_count : 0;
      let newVote = currentVote;
      if (currentVote) {
        // User is removing their upvote
        newLikes = Math.max(0, newLikes - 1);
        newVote = null;
      } else {
        // User is adding an upvote
        newLikes = newLikes + 1;
        newVote = true;
      }
      return {
        ...issue,
        likes_count: newLikes,
        user_vote: newVote
      };
    }));
    try {
      await voteGroupChallenge(itemId, user.id, isUpvote);
    } catch (error) {
      toast.error("Failed to register your vote");
    }
    toast.success(isUpvote ? "Upvoted!" : "Downvoted!");
  }, [user]);

  const deleteIssue = useCallback(async (issueId: string) => {
    try {
      await deleteGroupChallenge(issueId);
      setIssues(prev => prev.filter(issue => issue.id !== issueId));
      toast.success("Challenge deleted successfully");
    } catch (error) {
      console.error("Error deleting challenge:", error);
      toast.error("Failed to delete challenge");
    }
  }, []);

  const updateIssue = useCallback(async (issueId: string, data: { title: string; description: string; tags: string[] }) => {
    try {
      const updatedChallenge = await updateGroupChallenge(issueId, data);
      setIssues(prev => prev.map(issue => 
        issue.id === issueId 
          ? { ...issue, ...updatedChallenge }
          : issue
      ));
      toast.success("Challenge updated successfully");
      return updatedChallenge;
    } catch (error) {
      console.error("Error updating challenge:", error);
      toast.error("Failed to update challenge");
      throw error;
    }
  }, []);

  return {
    issues,
    loading,
    searchTerm,
    setSearchTerm,
    filterTag,
    setFilterTag,
    filteredIssues,
    allTags,
    formatDate,
    addIssue,
    selectedIssue,
    selectIssue,
    getIssueSolutions,
    solutions,
    userVotes,
    handleVote,
    deleteIssue,
    updateIssue,
  };
};
