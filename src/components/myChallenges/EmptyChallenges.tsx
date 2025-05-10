
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyChallengesProps {
  hasChallenges: boolean;
  onCreateChallenge: () => void;
}

const EmptyChallenges = ({ hasChallenges, onCreateChallenge }: EmptyChallengesProps) => {
  return (
    <Card className="text-center p-8">
      <CardContent>
        <p className="text-muted-foreground">
          {hasChallenges 
            ? "None of your challenges match the current filters." 
            : "You haven't created any challenges yet."}
        </p>
        <Button 
          variant="default" 
          className="mt-4"
          onClick={onCreateChallenge}
        >
          Create Your First Challenge
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyChallenges;
