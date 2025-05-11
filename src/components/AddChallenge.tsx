
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import ChallengeForm from "./challenges/ChallengeForm";
import { supabase } from "@/integrations/supabase/client";

const AddChallenge = () => {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Share Your Challenge</CardTitle>
        <CardDescription>
          Describe a challenge you're facing with caring for your parents.
          The community will share solutions and advice.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChallengeForm />
      </CardContent>
    </Card>
  );
};

export default AddChallenge;
