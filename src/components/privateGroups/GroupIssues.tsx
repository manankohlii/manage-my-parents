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
    getIssueSolutions,
    userVotes,
    handleVote,
    addSolution
  } = useIssues(groupId);

  // Determine active tab based on selected issue
  const activeTab = selectedIssue ? "detail" : "list";

  const handleSolutionAdd = (solution: any) => {
    if (selectedIssue) {
      addSolution(selectedIssue, solution);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Group Challenges</h3>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add New Challenge
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => {
        if (value === "list") {
          selectIssue("");
        }
      }}>
        {selectedIssue && (
          <TabsList className="mb-4">
            <TabsTrigger value="detail">Challenge Details</TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="list" className="space-y-4">
          <IssueFilter 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterTag={filterTag}
            setFilterTag={setFilterTag}
            allTags={allTags}
          />
          
          <IssuesList 
            issues={issues}
            filteredIssues={filteredIssues}
            loading={loading}
            formatDate={formatDate}
            onOpenAddDialog={() => setIsAddDialogOpen(true)}
            onSelectIssue={selectIssue}
            userVotes={userVotes}
            onVote={handleVote}
          />
        </TabsContent>

        {selectedIssue && (
          <TabsContent value="detail">
            <IssueDetail 
              issue={issues.find(i => i.id === selectedIssue)!}
              solutions={getIssueSolutions(selectedIssue)}
              formatDate={formatDate}
              onBack={() => selectIssue("")}
              userVotes={userVotes}
              onVote={handleVote}
              onSolutionAdd={handleSolutionAdd}
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
