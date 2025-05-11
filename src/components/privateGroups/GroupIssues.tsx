
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import IssuesList from "./issues/IssuesList";
import IssueFilter from "./issues/IssueFilter";
import IssueForm from "./issues/IssueForm";
import { useIssues } from "./issues/useIssues";

interface GroupIssuesProps {
  groupId: string;
}

const GroupIssues = ({ groupId }: GroupIssuesProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const {
    issues,
    loading,
    searchTerm,
    setSearchTerm,
    filterTag,
    setFilterTag,
    filteredIssues,
    allTags,
    formatDate,
    addIssue
  } = useIssues(groupId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <IssueFilter 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterTag={filterTag}
          setFilterTag={setFilterTag}
          allTags={allTags}
        />
        
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={16} className="mr-2" />
          New Issue
        </Button>
      </div>
      
      <IssuesList 
        issues={issues}
        filteredIssues={filteredIssues}
        loading={loading}
        formatDate={formatDate}
        onOpenAddDialog={() => setIsAddDialogOpen(true)}
      />
      
      <IssueForm
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onIssueCreate={addIssue}
      />
    </div>
  );
};

export default GroupIssues;
