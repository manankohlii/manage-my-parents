
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import IssuesList from "./issues/IssuesList";
import IssueFilter from "./issues/IssueFilter";
import IssueForm from "./issues/IssueForm";
import { useIssues } from "./issues/useIssues";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IssueDetail from "./issues/IssueDetail";

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
    addIssue,
    selectedIssue,
    selectIssue,
    getIssueSolutions
  } = useIssues(groupId);

  // Determine active tab based on selected issue
  const activeTab = selectedIssue ? "detail" : "list";

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(value) => {
        if (value === "list") {
          selectIssue("");
        }
      }}>
        <TabsList className="mb-4">
          <TabsTrigger value="list">All Issues</TabsTrigger>
          {selectedIssue && (
            <TabsTrigger value="detail">Issue Details</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="space-y-4">
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
            onSelectIssue={selectIssue}
          />
        </TabsContent>

        {selectedIssue && (
          <TabsContent value="detail">
            <IssueDetail 
              issue={issues.find(i => i.id === selectedIssue)!}
              solutions={getIssueSolutions(selectedIssue)}
              formatDate={formatDate}
              onBack={() => selectIssue("")}
            />
          </TabsContent>
        )}
      </Tabs>
      
      <IssueForm
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onIssueCreate={addIssue}
      />
    </div>
  );
};

export default GroupIssues;
