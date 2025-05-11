
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { mockIssues, Issue } from "./mockIssueData";

export const useIssues = (groupId: string) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading issues data
    const loadIssues = async () => {
      try {
        // Would fetch from Supabase in a real implementation
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Enhance mock data with random tag distribution for better testing
        const enhancedMockIssues = mockIssues.map(issue => {
          // Ensure each issue has 1-3 random tags for better filtering experience
          const allAvailableTags = Array.from(
            new Set(mockIssues.flatMap(i => i.tags))
          );
          
          if (issue.tags.length === 0) {
            const numTags = Math.floor(Math.random() * 3) + 1;
            const randomTags = [];
            for (let i = 0; i < numTags; i++) {
              const randomTag = allAvailableTags[
                Math.floor(Math.random() * allAvailableTags.length)
              ];
              if (!randomTags.includes(randomTag)) {
                randomTags.push(randomTag);
              }
            }
            return {...issue, tags: randomTags};
          }
          
          return issue;
        });
        
        setIssues(enhancedMockIssues);
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
    selectIssue
  };
};
