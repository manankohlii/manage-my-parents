import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export interface Issue {
  id: string;
  title: string;
  description: string;
  userId: string;
  userName: string;
  createdAt: string;
  tags: string[];
  solutionCount: number;
  votes: number;
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
    // Simulate loading issues data
    const loadIssues = async () => {
      try {
        // Would fetch from Supabase in a real implementation
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Start with empty list
        setIssues([]);
        setSolutions({});

        // Initialize empty user votes
        setUserVotes({});
        
      } catch (error) {
        console.error("Error loading issues:", error);
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
  }, [groupId, uiToast]);

  // Filter issues based on search term and selected tag
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !filterTag || issue.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  // Get all unique tags from issues
  const allTags = Array.from(new Set(issues.flatMap(issue => issue.tags)));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const addIssue = useCallback((newIssue: Issue) => {
    setIssues(prev => [newIssue, ...prev]);
  }, []);

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

    // Update the solution count for the issue
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        return {
          ...issue,
          solutionCount: issue.solutionCount + 1
        };
      }
      return issue;
    }));
  }, []);

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
    handleVote,
    addSolution
  };
};
