
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Tag, Calendar } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  onSelect?: (issueId: string) => void;
}

const IssueItem = ({ issue, formatDate, onSelect }: IssueItemProps) => {
  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleClick = () => {
    if (onSelect) onSelect(issue.id);
  };

  return (
    <TableRow 
      key={issue.id} 
      className={onSelect ? "cursor-pointer hover:bg-secondary/20" : ""} 
      onClick={handleClick}
    >
      <TableCell>
        <div>
          <div className="font-medium text-primary">{issue.title}</div>
          <div className="text-sm text-muted-foreground line-clamp-1">
            {truncateDescription(issue.description)}
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
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-medium">{issue.userName}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>User ID: {issue.userId}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell>
        <div className="flex items-center text-muted-foreground">
          <Calendar size={14} className="mr-1" />
          {formatDate(issue.createdAt)}
        </div>
      </TableCell>
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
