
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Tag } from "lucide-react";

interface Issue {
  id: string;
  title: string;
  description: string;
  userId: string;
  userName: string;
  createdAt: string;
  tags: string[];
  solutionCount: number;
}

interface IssueItemProps {
  issue: Issue;
  formatDate: (dateString: string) => string;
}

const IssueItem = ({ issue, formatDate }: IssueItemProps) => {
  return (
    <TableRow key={issue.id}>
      <TableCell>
        <div>
          <div className="font-medium">{issue.title}</div>
          <div className="text-sm text-muted-foreground line-clamp-1">
            {issue.description}
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {issue.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag size={10} className="mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </TableCell>
      <TableCell>{issue.userName}</TableCell>
      <TableCell>{formatDate(issue.createdAt)}</TableCell>
      <TableCell className="text-right">
        <Badge variant="secondary" className="flex items-center gap-1 w-fit ml-auto">
          <MessageCircle size={12} />
          {issue.solutionCount}
        </Badge>
      </TableCell>
    </TableRow>
  );
};

export default IssueItem;
