
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import IssueItem from "./IssueItem";

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

interface IssuesListProps {
  issues: Issue[];
  filteredIssues: Issue[];
  loading: boolean;
  formatDate: (dateString: string) => string;
  onOpenAddDialog: () => void;
  onSelectIssue: (issueId: string) => void;
}

const IssuesList = ({ 
  issues, 
  filteredIssues, 
  loading, 
  formatDate, 
  onOpenAddDialog,
  onSelectIssue
}: IssuesListProps) => {
  return (
    <Card>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4">
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No Issues Found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {issues.length === 0 
                ? "Be the first to post an issue to this group!"
                : "No issues match your search criteria."}
            </p>
            <Button 
              className="mt-4"
              onClick={onOpenAddDialog}
            >
              Create First Issue
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Issue</TableHead>
                <TableHead>Posted By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Solutions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.map((issue) => (
                <IssueItem 
                  key={issue.id} 
                  issue={issue} 
                  formatDate={formatDate}
                  onSelect={onSelectIssue}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default IssuesList;
