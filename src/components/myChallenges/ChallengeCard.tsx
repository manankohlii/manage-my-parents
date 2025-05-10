
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import TagBadge from "../TagBadge";
import { Challenge } from "@/services/challengesService";

interface ChallengeCardProps {
  challenge: Challenge;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const ChallengeCard = ({ challenge, onDelete, onEdit }: ChallengeCardProps) => {
  return (
    <Card key={challenge.id} className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{challenge.title}</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEdit(challenge.id)}
            >
              <Edit size={18} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDelete(challenge.id)}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-3">{challenge.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {challenge.tags && challenge.tags.map((tag) => (
            <TagBadge key={tag} text={tag} />
          ))}
        </div>
        
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Age Group: {challenge.age_group}</span>
            <span>Location: {challenge.location}</span>
            <span>Mood: {challenge.mood}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <span className="text-sm text-muted-foreground">
          Posted on {new Date(challenge.created_at).toLocaleDateString()}
        </span>
        <Button variant="link" className="px-0">
          View {challenge.solutions_count || 0} solutions
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ChallengeCard;
