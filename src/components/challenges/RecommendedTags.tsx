
import TagBadge from "../TagBadge";

interface RecommendedTagsProps {
  recommendedTags: string[];
  onAddTag: (tag: string) => void;
}

const RecommendedTags = ({ recommendedTags, onAddTag }: RecommendedTagsProps) => {
  if (recommendedTags.length === 0) return null;
  
  return (
    <div className="mt-2">
      <p className="text-sm text-muted-foreground mb-1">Recommended tags:</p>
      <div className="flex flex-wrap gap-2">
        {recommendedTags.map(tag => (
          <TagBadge 
            key={tag} 
            text={tag}
            onClick={() => onAddTag(tag)}
            className="cursor-pointer bg-muted hover:bg-primary hover:text-white"
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendedTags;
