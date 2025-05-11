
import { useState, useEffect } from "react";
import { getAllChallenges, Challenge } from "@/services/challengesService";
import { getAllTags } from "@/services/challenges/tagService";
import { toast } from "sonner";

export const useChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);

  // Load challenges and tags
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        const [fetchedChallenges, fetchedTags] = await Promise.all([
          getAllChallenges(),
          getAllTags()
        ]);
        
        setChallenges(fetchedChallenges);
        setAllTags(fetchedTags);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load challenges");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const updateChallengeStats = (challengeId: string, field: 'solutions_count' | 'votes_count', value: number) => {
    setChallenges(prev => 
      prev.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, [field]: value }
          : challenge
      )
    );
  };

  return {
    challenges,
    setChallenges,
    loading,
    allTags,
    updateChallengeStats
  };
};
