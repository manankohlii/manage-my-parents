
import { useState, useEffect } from "react";
import TagsDisplay from "../TagsDisplay";
import TagInput from "../TagInput";
import PopularTags from "../PopularTags";
import RecommendedTags from "../RecommendedTags";
import { FormLabel } from "@/components/ui/form";

// Suggested tags based on common terms in eldercare
const suggestedTags = [
  "medication", "memory", "mobility", "healthcare", "finances", 
  "independence", "social", "technology", "safety", "nutrition",
  "mental-health", "housing", "transportation", "legal", "communication"
];

interface TagsSectionProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  description: string;
  existingTags: string[];
  popularTags: string[];
}

const TagsSection = ({ 
  tags, 
  setTags, 
  description, 
  existingTags,
  popularTags 
}: TagsSectionProps) => {
  const [tagInput, setTagInput] = useState("");
  const [recommendedTags, setRecommendedTags] = useState<string[]>([]);
  
  // Simple algorithm to recommend tags based on content
  useEffect(() => {
    if (description) {
      const lowerDesc = description.toLowerCase();
      // Combine suggested tags with existing tags from the database for recommendations
      const allPossibleTags = [...new Set([...suggestedTags, ...existingTags])];
      const recommended = allPossibleTags.filter(tag => 
        lowerDesc.includes(tag.toLowerCase()) && !tags.includes(tag)
      );
      setRecommendedTags(recommended.slice(0, 5));
    } else {
      setRecommendedTags([]);
    }
  }, [description, tags, existingTags]);
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleAddRecommendedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
      setRecommendedTags(recommendedTags.filter(t => t !== tag));
    }
  };
  
  const handleAddPopularTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };
  
  return (
    <div>
      <FormLabel>Tags</FormLabel>
      <TagsDisplay tags={tags} onRemoveTag={handleRemoveTag} />
      
      <TagInput 
        tags={tags}
        setTags={setTags}
        existingTags={existingTags}
        tagInput={tagInput}
        setTagInput={setTagInput}
      />
      
      <PopularTags 
        popularTags={popularTags}
        onAddTag={handleAddPopularTag}
      />
      
      <RecommendedTags 
        recommendedTags={recommendedTags}
        onAddTag={handleAddRecommendedTag}
      />
    </div>
  );
};

export default TagsSection;
