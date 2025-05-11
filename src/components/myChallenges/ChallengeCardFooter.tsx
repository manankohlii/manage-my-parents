
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ChallengeCardFooterProps {
  createdAt: string;
  solutionsCount: number;
  isLoadingSolutions: boolean;
  showingSolutions: boolean;
  onViewSolutions: () => void;
}

const ChallengeCardFooter = ({ 
  createdAt, 
  solutionsCount, 
  isLoadingSolutions, 
  showingSolutions, 
  onViewSolutions 
}: ChallengeCardFooterProps) => {
  return (
    <CardFooter className="border-t pt-4 flex justify-between">
      <span className="text-sm text-muted-foreground">
        Posted on {new Date(createdAt).toLocaleDateString()}
      </span>
      <Button 
        variant="link" 
        className="px-0" 
        onClick={onViewSolutions}
        disabled={isLoadingSolutions}
      >
        {isLoadingSolutions ? "Loading..." : showingSolutions 
          ? "Hide solutions" 
          : `View ${solutionsCount || 0} solutions`}
      </Button>
    </CardFooter>
  );
};

export default ChallengeCardFooter;
