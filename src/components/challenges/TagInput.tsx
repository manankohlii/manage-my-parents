import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TagBadge from "../TagBadge";
import { Tag } from "lucide-react";

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  existingTags: string[];
  tagInput: string;
  setTagInput: (input: string) => void;
}

const TagInput = ({ 
  tags, 
  setTags, 
  existingTags, 
  tagInput, 
  setTagInput 
}: TagInputProps) => {
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  
  // Filter tags for autocomplete based on input
  useEffect(() => {
    if (tagInput) {
      const filtered = existingTags.filter(tag => 
        tag.toLowerCase().includes(tagInput.toLowerCase()) && 
        !tags.includes(tag)
      );
      setFilteredTags(filtered.slice(0, 5));
      setShowAutocomplete(filtered.length > 0);
    } else {
      setFilteredTags([]);
      setShowAutocomplete(false);
    }
  }, [tagInput, existingTags, tags]);
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
      setShowAutocomplete(false);
    }
  };
  
  const handleSelectAutocompleteTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
      setShowAutocomplete(false);
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex gap-2 relative">
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="Add relevant tags..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddTag();
            }
          }}
          onFocus={() => tagInput && setShowAutocomplete(filteredTags.length > 0)}
          onBlur={() => setTimeout(() => setShowAutocomplete(false), 100)}
        />
        <Button type="button" onClick={handleAddTag}>Add Tag</Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2 bg-muted/50 p-1.5 rounded-md">Press Enter to add a tag</p>
      
      {/* Tag Autocomplete dropdown */}
      {showAutocomplete && filteredTags.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-[calc(100%-5rem)] bg-white dark:bg-gray-800 border rounded-md shadow-lg z-10">
          {filteredTags.map((tag) => (
            <div 
              key={tag}
              className="px-3 py-2 hover:bg-muted cursor-pointer flex items-center gap-2"
              onClick={() => handleSelectAutocompleteTag(tag)}
            >
              <Tag size={14} />
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
