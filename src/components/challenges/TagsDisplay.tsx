
import TagBadge from "../TagBadge";

interface TagsDisplayProps {
  tags: string[];
  onRemoveTag: (tag: string) => void;
}

const TagsDisplay = ({ tags, onRemoveTag }: TagsDisplayProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {tags.map(tag => (
        <TagBadge 
          key={tag} 
          text={tag} 
          onClick={() => onRemoveTag(tag)}
          className="cursor-pointer hover:bg-red-100"
        />
      ))}
    </div>
  );
};

export default TagsDisplay;
