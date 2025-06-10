import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import IssuesList from "./issues/IssuesList";
// import IssueFilter from "./issues/IssueFilter";
import { useIssues } from "./issues/useIssues";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IssueDetail from "./issues/IssueDetail";
import ChallengeForm from "@/components/challenges/ChallengeForm";
import ChallengeFilters from "@/components/explore/ChallengeFilters";
import { Card, CardContent } from "@/components/ui/card";

interface GroupIssuesProps {
  groupId: string;
}

const GroupIssues = ({ groupId }: GroupIssuesProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // New filter state for group challenges
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("most_upvotes");
  const [filterLocation, setFilterLocation] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const {
    issues,
    loading,
    // searchTerm,
    // setSearchTerm,
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
    deleteIssue,
    updateIssue,
    // addSolution
  } = useIssues(groupId);

  // Determine active tab based on selected issue
  const activeTab = selectedIssue ? "detail" : "list";

  const handleSolutionAdd = (solution: any) => {
    if (selectedIssue) {
      // addSolution(selectedIssue, solution);
    }
  };

  // Handler for when a challenge is submitted
  const handleChallengeSubmit = () => {
    setShowAddForm(false);
    // Optionally reload issues here if needed
  };

  // Scroll to form when adding
  useEffect(() => {
    if (showAddForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showAddForm]);

  // Filter challenges based on search, tags, location, sort
  const issuesWithLocation = issues.map(challenge => ({ ...challenge, location: challenge.location || "" }));
  const filteredChallenges = issuesWithLocation.filter(challenge => {
    const matchesSearch =
      !searchTerm ||
      challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      (challenge.tags && selectedTags.some(tag => challenge.tags.includes(tag)));
    const matchesLocation =
      filterLocation === "all" || challenge.location === filterLocation;
    return matchesSearch && matchesTags && matchesLocation;
  }).sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortBy === "most_upvotes") {
      return (b.votes || 0) - (a.votes || 0);
    } else if (sortBy === "most_solutions") {
      return (b.solutionCount || 0) - (a.solutionCount || 0);
    }
    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Group Challenges</h3>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Share Challenge
        </Button>
      </div>

      {/* Divider for visual separation */}
      <div className="border-b border-gray-200 dark:border-gray-700 my-4" />

      {showAddForm && (
        <Card ref={formRef} className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <ChallengeForm 
              onSubmit={handleChallengeSubmit} 
              onClose={() => setShowAddForm(false)} 
              onSubmitChallenge={addIssue}
            />
          </CardContent>
        </Card>
      )}

      {/* Use ChallengeFilters from explore for consistent UI */}
      <ChallengeFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterAgeGroup={""}
        setFilterAgeGroup={() => {}}
        filterLocation={filterLocation}
        setFilterLocation={setFilterLocation}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        allTags={allTags}
        challenges={issuesWithLocation}
      />

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
          <IssuesList 
            issues={issues}
            filteredIssues={filteredChallenges}
            loading={loading}
            formatDate={formatDate}
            onOpenAddDialog={() => setShowAddForm(true)}
            onSelectIssue={selectIssue}
            userVotes={userVotes}
            onVote={handleVote}
            onIssueDeleted={deleteIssue}
            updateIssue={updateIssue}
          />
        </TabsContent>

        {selectedIssue && (
          <TabsContent value="detail">
            <IssueDetail 
              issue={issues.find(i => i.id === selectedIssue)!}
              formatDate={formatDate}
              onBack={() => selectIssue("")}
              userVotes={userVotes}
              onVote={handleVote}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default GroupIssues;
