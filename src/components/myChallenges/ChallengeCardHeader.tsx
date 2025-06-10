import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader as DialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

interface ChallengeCardHeaderProps {
  title: string;
  onEdit: (e: React.MouseEvent) => void;
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                aria-label="Delete Challenge"
              >
                <Trash2 size={18} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <DialogHeader>
                <AlertDialogTitle>Are you sure you want to delete this challenge?</AlertDialogTitle>
              </DialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-red-500 hover:bg-red-600 text-white">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </CardHeader>
  );
};

export default ChallengeCardHeader;
