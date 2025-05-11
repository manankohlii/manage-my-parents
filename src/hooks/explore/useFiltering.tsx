
import { useState } from "react";
import { Challenge } from "@/services/challenges/types";

export const useFiltering = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [filterAgeGroup, setFilterAgeGroup] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Filtering and sorting challenges
  const getFilteredChallenges = (challenges: Challenge[]) => {
    return challenges
      .filter(challenge => {
        if (filterAgeGroup === "all") return true;
        
        // Match challenges with the corresponding age group range
        switch (filterAgeGroup) {
          case "13-19":
          case "20-34":
          case "35-49":
          case "50-64":
          case "65-79":
          case "80+":
            return challenge.age_group === filterAgeGroup;
          default:
            return true;
        }
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
        if (sortBy === "newest") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else if (sortBy === "oldest") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        } else if (sortBy === "popular") {
          return (b.votes_count || 0) - (a.votes_count || 0);
        } else if (sortBy === "most_solutions") {
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
