
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { mockIssues, mockSolutions, Issue } from "./mockIssueData";

export const useIssues = (groupId: string) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [solutions, setSolutions] = useState<Record<string, any>>({});
  
  const { toast } = useToast();

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
      } catch (error) {
        console.error("Error loading issues:", error);
        toast({
          title: "Failed to load issues",
          description: "Could not load group issues. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadIssues();
  }, [groupId, toast]);

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
    solutions
  };
};
