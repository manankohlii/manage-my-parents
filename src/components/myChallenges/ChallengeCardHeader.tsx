
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ChallengeCardHeaderProps {
  title: string;
  onEdit: () => void;
  onDelete: () => void;
}

const ChallengeCardHeader = ({ title, onEdit, onDelete }: ChallengeCardHeaderProps) => {
  return (
    <CardHeader>
      <div className="flex justify-between items-start">
        <CardTitle className="text-xl">{title}</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onEdit}
          >
            <Edit size={18} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onDelete}
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default ChallengeCardHeader;
