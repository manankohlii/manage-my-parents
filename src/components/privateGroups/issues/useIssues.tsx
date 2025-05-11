import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { mockIssues, mockSolutions, Issue, IssueSolution } from "./mockIssueData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useIssues = (groupId: string) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [solutions, setSolutions] = useState<Record<string, IssueSolution[]>>({});
  const [userVotes, setUserVotes] = useState<Record<string, boolean | null>>({});
  
  const { toast: uiToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Simulate loading issues data
    const loadIssues = async () => {
      try {
        // Would fetch from Supabase in a real implementation
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Use our mock data with additional tags for better filtering
        setIssues(mockIssues);
        setSolutions(mockSolutions);

        // Initialize mock user votes
        const initialVotes: Record<string, boolean | null> = {};
        // Set some initial votes for demo purposes
        if (user) {
          initialVotes[mockIssues[0].id] = true; // Upvoted first issue
          if (mockSolutions[mockIssues[0].id]?.[0]) {
            initialVotes[mockSolutions[mockIssues[0].id][0].id] = true; // Upvoted first solution
          }
        }
        setUserVotes(initialVotes);
      } catch (error) {
        console.error("Error loading issues:", error);
        uiToast({
          title: "Failed to load issues",
          description: "Could not load group issues. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadIssues();
  }, [groupId, uiToast, user]);

  // Format date display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Filter issues based on search term and tag
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = searchTerm === "" || 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = filterTag === "" || 
      issue.tags.some(tag => tag.toLowerCase() === filterTag.toLowerCase());
    
    return matchesSearch && matchesTag;
  });

  // Get all unique tags from issues
  const allTags = Array.from(
    new Set(issues.flatMap(issue => issue.tags))
  ).sort();

  const addIssue = useCallback((newIssue: Issue) => {
    setIssues(prev => [newIssue, ...prev]);
  }, []);

  const selectIssue = useCallback((issueId: string) => {
    setSelectedIssue(issueId);
  }, []);

  const getIssueSolutions = useCallback((issueId: string) => {
    return solutions[issueId] || [];
  }, [solutions]);

  // Handle voting for issue or solution
  const handleVote = useCallback((itemId: string, isUpvote: boolean) => {
    if (!user) {
      toast.error("Please log in to vote");
      return;
    }

    setUserVotes(prev => {
      const currentVote = prev[itemId];
      
      // If voting the same way, remove the vote
      if (currentVote === isUpvote) {
        const newVotes = { ...prev };
        delete newVotes[itemId];
        return newVotes;
      }
      
      // Otherwise set or change the vote
      return {
        ...prev,
        [itemId]: isUpvote
      };
    });

    // Update solution votes if it's a solution
    setSolutions(prev => {
      const updatedSolutions: Record<string, IssueSolution[]> = { ...prev };
      
      // Check all solution groups
      for (const issueId in updatedSolutions) {
        updatedSolutions[issueId] = updatedSolutions[issueId].map(solution => {
          if (solution.id === itemId) {
            // Calculate vote change
            const currentVote = userVotes[itemId];
            let voteChange = 0;
            
            if (currentVote === undefined || currentVote === null) {
              // New vote
              voteChange = isUpvote ? 1 : -1;
            } else if (currentVote === isUpvote) {
              // Removing vote
              voteChange = isUpvote ? -1 : 1;
            } else {
              // Changing vote direction
              voteChange = isUpvote ? 2 : -2;
            }
            
            return {
              ...solution,
              votes: solution.votes + voteChange
            };
          }
          return solution;
        });
      }
      
      return updatedSolutions;
    });
    
    // In a real app, we would call an API to persist the vote
    toast.success(isUpvote ? "Upvoted!" : "Downvoted!");
  }, [user, userVotes]);

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
    handleVote
  };
};
