
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import ChallengeCard from "@/components/explore/ChallengeCard";
import TagBadge from "@/components/TagBadge";
import { Link } from "react-router-dom";
import { mockTrendingTags } from "@/data/mockData";
import { getAllChallenges } from "@/services/challenges";
import { Challenge } from "@/services/challenges/types";
import { useSolutions } from "@/hooks/explore/useSolutions";
import { useVoting } from "@/hooks/explore/useVoting";
import { useAuth } from "@/contexts/AuthContext";

const CommunityPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  
  const { userVotes, updateUserVotesForSolutions, handleVote } = useVoting(user);
  
  const {
    solutions,
    openPopover,
    setOpenPopover,
    newSolution, 
    setNewSolution,
    loadingSolution,
    loadSolutions,
    handleSubmitSolution
  } = useSolutions(user, updateUserVotesForSolutions);

  // Load challenges from the database
  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      try {
        const fetchedChallenges = await getAllChallenges();
        setChallenges(fetchedChallenges);
        
        // Pre-load solutions for challenges with solutions_count > 0
        fetchedChallenges.forEach(challenge => {
          if ((challenge.solutions_count || 0) > 0) {
            loadSolutions(challenge.id);
          }
        });
      } catch (error) {
        console.error("Error fetching challenges:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChallenges();
  }, [loadSolutions]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const filteredChallenges = challenges.filter((challenge) => {
    // Filter by search query
    const matchesSearch = 
      searchQuery === "" || 
      challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by selected tags
    const matchesTags = 
      selectedTags.length === 0 || 
      challenge.tags?.some(tag => selectedTags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Community</h1>
        <Button asChild>
          <Link to="/post/new">
            <Plus className="mr-2 h-4 w-4" />
            New Challenge
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-8">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search community challenges..."
            className="w-full pl-12 py-6 text-base rounded-full"
          />
        </div>

        <div>
          <h2 className="text-lg font-medium mb-3">Filter by Tags</h2>
          <div className="flex flex-wrap gap-2">
            {mockTrendingTags.map((tag) => (
              <TagBadge
                key={tag.name}
                text={tag.name}
                className={selectedTags.includes(tag.name) ? "bg-primary text-white" : ""}
                onClick={() => toggleTag(tag.name)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Challenges Tabs */}
      <Tabs defaultValue="latest" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="latest">Latest</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="solved">Solved</TabsTrigger>
        </TabsList>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse">Loading challenges...</div>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No challenges found.</p>
          </div>
        ) : (
          <>
            <TabsContent value="latest" className="space-y-6">
              {filteredChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  handleUpvote={(challengeId) => handleVote(challengeId, null, 'up')}
                  handleDownvote={(challengeId) => handleVote(challengeId, null, 'down')}
                  handleSubmitSolution={(challengeId) => {
                    loadSolutions(challengeId);
                    return handleSubmitSolution(challengeId);
                  }}
                  newSolution={newSolution}
                  setNewSolution={setNewSolution}
                  loadingSolution={loadingSolution}
                  userVotes={userVotes}
                  openSolutionForm={openPopover}
                  setOpenSolutionForm={(challengeId) => {
                    setOpenPopover(challengeId);
                    if (challengeId) {
                      loadSolutions(challengeId);
                    }
                  }}
                  user={user}
                  solutions={solutions}
                  handleVote={handleVote}
                />
              ))}
            </TabsContent>
            
            <TabsContent value="trending" className="space-y-6">
              {filteredChallenges
                .sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))
                .map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    handleUpvote={(challengeId) => handleVote(challengeId, null, 'up')}
                    handleDownvote={(challengeId) => handleVote(challengeId, null, 'down')}
                    handleSubmitSolution={(challengeId) => {
                      loadSolutions(challengeId);
                      return handleSubmitSolution(challengeId);
                    }}
                    newSolution={newSolution}
                    setNewSolution={setNewSolution}
                    loadingSolution={loadingSolution}
                    userVotes={userVotes}
                    openSolutionForm={openPopover}
                    setOpenSolutionForm={(challengeId) => {
                      setOpenPopover(challengeId);
                      if (challengeId) {
                        loadSolutions(challengeId);
                      }
                    }}
                    user={user}
                    solutions={solutions}
                    handleVote={handleVote}
                  />
                ))}
            </TabsContent>
            
            <TabsContent value="solved" className="space-y-6">
              {filteredChallenges
                .filter((challenge) => (challenge.solutions_count || 0) > 0)
                .map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    handleUpvote={(challengeId) => handleVote(challengeId, null, 'up')}
                    handleDownvote={(challengeId) => handleVote(challengeId, null, 'down')}
                    handleSubmitSolution={(challengeId) => {
                      loadSolutions(challengeId);
                      return handleSubmitSolution(challengeId);
                    }}
                    newSolution={newSolution}
                    setNewSolution={setNewSolution}
                    loadingSolution={loadingSolution}
                    userVotes={userVotes}
                    openSolutionForm={openPopover}
                    setOpenSolutionForm={(challengeId) => {
                      setOpenPopover(challengeId);
                      if (challengeId) {
                        loadSolutions(challengeId);
                      }
                    }}
                    user={user}
                    solutions={solutions}
                    handleVote={handleVote}
                  />
                ))}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default CommunityPage;
