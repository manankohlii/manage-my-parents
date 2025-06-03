
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

const GroupInvitations = () => {
  return (
    <Card className="text-center p-8">
      <CardContent className="pt-6">
        <User className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Invitations Coming Soon</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Group invitations will be available in a future update. For now, you can add members directly to your groups.
        </p>
      </CardContent>
    </Card>
  );
};

export default GroupInvitations;
