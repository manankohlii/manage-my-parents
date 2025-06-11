import { CardContent } from "@/components/ui/card";
import TagBadge from "../TagBadge";

interface ChallengeCardContentProps {
  description: string;
  tags?: string[];
  location: string;
}

const ChallengeCardContent = ({ description, tags, location }: ChallengeCardContentProps) => {
  return (
    <CardContent>
      <p className="text-muted-foreground mb-3">{description}</p>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {tags && tags.map((tag) => (
          <TagBadge key={tag} text={tag} />
        ))}
      </div>
    </CardContent>
  );
};

export default ChallengeCardContent;
