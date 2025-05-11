
import TagBadge from "../TagBadge";
import { Tag as TagIcon } from "lucide-react";

interface PopularTagsProps {
  popularTags: string[];
  onAddTag: (tag: string) => void;
}

const PopularTags = ({ popularTags, onAddTag }: PopularTagsProps) => {
  if (popularTags.length === 0) return null;
  
  return (
    <div className="mt-4">
      <p className="text-sm text-muted-foreground mb-2 flex items-center">
        <TagIcon size={14} className="mr-1" />
        Popular tags:
      </p>
      <div className="flex flex-wrap gap-2">
        {popularTags.map(tag => (
          <TagBadge 
            key={tag} 
            text={tag}
            onClick={() => onAddTag(tag)}
            className="cursor-pointer bg-muted hover:bg-primary hover:text-white"
            size="sm"
          />
        ))}
      </div>
    </div>
  );
};

export default PopularTags;
