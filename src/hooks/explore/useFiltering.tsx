import { useState } from "react";
import { Challenge } from "@/services/challenges/types";

export const useFiltering = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filterAgeGroup, setFilterAgeGroup] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Filtering and sorting challenges
  const getFilteredChallenges = (challenges: Challenge[]) => {
    return challenges
      .filter(challenge => {
        // If filterAgeGroup is 'all', show all challenges
        if (filterAgeGroup === "all") return true;
        // Otherwise, filter by the selected age group
        return challenge.age_group === filterAgeGroup;
      })
      .filter(challenge => filterLocation === "all" || challenge.location === filterLocation)
      .filter(challenge => {
        if (selectedTags.length === 0) return true;
        return challenge.tags && selectedTags.some(tag => challenge.tags?.includes(tag));
      })
      .filter(challenge => 
        !searchTerm || 
        challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (challenge.tags && challenge.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      )
      .sort((a, b) => {
        const effectiveSortBy = sortBy || "most_upvotes";
        if (effectiveSortBy === "newest") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else if (effectiveSortBy === "oldest") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        } else if (effectiveSortBy === "most_upvotes") {
          return (b.likes_count || 0) - (a.likes_count || 0);
        } else if (effectiveSortBy === "most_solutions") {
          return (b.solutions_count || 0) - (a.solutions_count || 0);
        }
        return 0;
      });
  };

  return {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filterAgeGroup,
    setFilterAgeGroup,
    filterLocation,
    setFilterLocation,
    selectedTags,
    setSelectedTags,
    getFilteredChallenges
  };
};
