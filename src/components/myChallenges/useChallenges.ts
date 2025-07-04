import { useState, useEffect } from "react";
import { getUserChallenges, deleteChallenge, updateChallenge, createChallenge, Challenge } from "@/services/challenges";
import { useAuth } from "@/contexts/AuthContext";

export const useChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadChallenges = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      const userChallenges = await getUserChallenges(user.id);
      setChallenges(userChallenges);
      setLoading(false);
    };

    loadChallenges();
  }, [user?.id]);

  const handleDeleteChallenge = async (id: string) => {
    const success = await deleteChallenge(id);
    if (success) {
      setChallenges(challenges.filter(challenge => challenge.id !== id));
    }
  };

  const handleUpdateChallenge = async (id: string, challengeData: any) => {
    const updatedChallenge = await updateChallenge(id, challengeData);
    if (updatedChallenge) {
      setChallenges(challenges.map(challenge => 
        challenge.id === id ? { ...challenge, ...updatedChallenge } : challenge
      ));
    }
  };

  const handleAddChallenge = async (challengeData: any) => {
    if (!user?.id) return;
    const newChallenge = await createChallenge(challengeData, user.id);
    if (newChallenge) {
      setChallenges(prev => [newChallenge, ...prev]);
    }
  };

  const getFilteredChallenges = () => {
    return challenges
      .filter(challenge => 
        !searchTerm || 
        challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (challenge.tags && challenge.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      )
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else if (sortBy === "oldest") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        } else if (sortBy === "most_solutions") {
          return (b.solutions_count || 0) - (a.solutions_count || 0);
        }
        return 0;
      });
  };

  return {
    challenges,
    loading,
    sortBy,
    setSortBy,
    searchTerm,
    setSearchTerm,
    handleDeleteChallenge,
    handleUpdateChallenge,
    handleAddChallenge,
    filteredChallenges: getFilteredChallenges()
  };
};
