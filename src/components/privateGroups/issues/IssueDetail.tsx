
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MessageCircle, Tag, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface IssueSolution {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: string;
  votes: number;
}

interface IssueDetailProps {
  issue: {
    id: string;
    title: string;
    description: string;
    userId: string;
    userName: string;
    createdAt: string;
    tags: string[];
    solutionCount: number;
  };
  solutions: IssueSolution[];
  formatDate: (dateString: string) => string;
  onBack: () => void;
}

const IssueDetail = ({ issue, solutions, formatDate, onBack }: IssueDetailProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={16} className="mr-2" />
          Back to Issues
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-semibold">{issue.title}</h2>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(issue.createdAt)}
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
            <User size={14} />
            <span>{issue.userName}</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {issue.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="flex items-center gap-1">
                <Tag size={10} />
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <p className="whitespace-pre-wrap">{issue.description}</p>

          <h3 className="font-medium text-lg mt-8 mb-4 flex items-center gap-2">
            <MessageCircle size={16} />
            Solutions ({solutions.length})
          </h3>

          {solutions.length === 0 ? (
            <div className="text-center py-8 bg-muted/20 rounded-md">
              <p className="text-muted-foreground">No solutions yet</p>
              <Button variant="outline" className="mt-2">Add Solution</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {solutions.map((solution) => (
                <div key={solution.id} className="bg-muted/20 p-4 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {solution.userName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{solution.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(solution.createdAt)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{solution.text}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueDetail;
