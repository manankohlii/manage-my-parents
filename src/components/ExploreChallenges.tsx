
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import TagBadge from "./TagBadge";
import { Search, ArrowUp, ArrowDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getAllChallenges, Challenge } from "@/services/challengesService";
import { createSolution, getSolutions, Solution } from "@/services/solutionsService";
import { voteChallenge, voteSolution, getUserChallengeVote, getUserSolutionVote } from "@/services/votesService";
import { getAllTags } from "@/services/challengesService";

const ExploreChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [solutions, setSolutions] = useState<Record<string, Solution[]>>({});
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("popular");
  const [filterAgeGroup, setFilterAgeGroup] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [newSolution, setNewSolution] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, boolean | null>>({});
  const [loadingSolution, setLoadingSolution] = useState(false);

  // Load challenges and tags
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        const [fetchedChallenges, fetchedTags] = await Promise.all([
          getAllChallenges(),
          getAllTags()
        ]);
        
        setChallenges(fetchedChallenges);
        setAllTags(fetchedTags);
        
        // Load user votes if user is logged in
        if (user?.id) {
          const votes: Record<string, boolean | null> = {};
          
          for (const challenge of fetchedChallenges) {
            const vote = await getUserChallengeVote(challenge.id, user.id);
            votes[challenge.id] = vote;
          }
          
          setUserVotes(votes);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load challenges");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user?.id]);

  // Load solutions for a challenge when expanded
  const loadSolutions = async (challengeId: string) => {
    if (solutions[challengeId]) return;
    
    try {
      const fetchedSolutions = await getSolutions(challengeId);
      setSolutions(prev => ({
        ...prev,
        [challengeId]: fetchedSolutions
      }));
      
      // Load user votes for solutions if user is logged in
      if (user?.id) {
        const updatedVotes = { ...userVotes };
        
        for (const solution of fetchedSolutions) {
          const vote = await getUserSolutionVote(solution.id, user.id);
          updatedVotes[solution.id] = vote;
        }
        
        setUserVotes(updatedVotes);
      }
    } catch (error) {
      console.error("Error loading solutions:", error);
      toast.error("Failed to load solutions");
    }
  };

  const handleSubmitSolution = async (challengeId: string) => {
    if (!user?.id) {
      toast.error("You must be logged in to submit a solution");
      return;
    }
    
    if (!newSolution.trim()) {
      toast.error("Solution cannot be empty");
      return;
    }

    setLoadingSolution(true);
    
    try {
      const solution = await createSolution(challengeId, newSolution, user.id);
      
      if (solution) {
        // Update the solutions list
        setSolutions(prev => {
          const updatedSolutions = prev[challengeId] ? [solution, ...prev[challengeId]] : [solution];
          return {
            ...prev,
            [challengeId]: updatedSolutions
          };
        });
        
        // Also update the challenge solutions count
        setChallenges(prev => 
          prev.map(challenge => 
            challenge.id === challengeId 
              ? { ...challenge, solutions_count: (challenge.solutions_count || 0) + 1 }
              : challenge
          )
        );
        
        setNewSolution("");
        setOpenPopover(null);
      }
    } finally {
      setLoadingSolution(false);
    }
  };

  const handleVote = async (challengeId: string, solutionId: string | null, voteType: 'up' | 'down') => {
    if (!user?.id) {
      toast.error("You must be logged in to vote");
      return;
    }
    
    const isUpvote = voteType === 'up';
    let success;
    
    if (solutionId) {
      // Vote on a solution
      success = await voteSolution(solutionId, user.id, isUpvote);
      
      if (success) {
        // Update solutions with new vote count
        setSolutions(prev => {
          const challengeSolutions = prev[challengeId] || [];
          
          return {
            ...prev,
            [challengeId]: challengeSolutions.map(solution => {
              if (solution.id === solutionId) {
                const currentVote = userVotes[solutionId];
                let voteChange = 0;
                
                if (currentVote === null) {
                  // New vote
                  voteChange = isUpvote ? 1 : -1;
                } else if (currentVote === isUpvote) {
                  // Removing vote
                  voteChange = isUpvote ? -1 : 1;
                } else {
                  // Changing vote direction
                  voteChange = isUpvote ? 2 : -2;
                }
                
                return {
                  ...solution,
                  votes: (solution.votes || 0) + voteChange
                };
              }
              return solution;
            })
          };
        });
        
        // Update user votes
        setUserVotes(prev => {
          const currentVote = prev[solutionId];
          return {
            ...prev,
            [solutionId]: currentVote === isUpvote ? null : isUpvote
          };
        });
      }
    } else {
      // Vote on a challenge
      success = await voteChallenge(challengeId, user.id, isUpvote);
      
      if (success) {
        // Update challenges with new vote count
        setChallenges(prev => {
          return prev.map(challenge => {
            if (challenge.id === challengeId) {
              const currentVote = userVotes[challengeId];
              let voteChange = 0;
              
              if (currentVote === null) {
                // New vote
                voteChange = isUpvote ? 1 : -1;
              } else if (currentVote === isUpvote) {
                // Removing vote
                voteChange = isUpvote ? -1 : 1;
              } else {
                // Changing vote direction
                voteChange = isUpvote ? 2 : -2;
              }
              
              return {
                ...challenge,
                votes_count: (challenge.votes_count || 0) + voteChange
              };
            }
            return challenge;
          });
        });
        
        // Update user votes
        setUserVotes(prev => {
          const currentVote = prev[challengeId];
          return {
            ...prev,
            [challengeId]: currentVote === isUpvote ? null : isUpvote
          };
        });
      }
    }
  };

  const handleSelectTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const filteredChallenges = challenges
    .filter(challenge => filterAgeGroup === "all" || challenge.age_group === filterAgeGroup)
    .filter(challenge => filterLocation === "all" || challenge.location === filterLocation)
    .filter(challenge => {
      if (selectedTags.length === 0) return true;
      return challenge.tags && selectedTags.some(tag => challenge.tags?.includes(tag));
    })
    .filter(challenge => 
      !searchTerm || 
      challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (challenge.tags && challenge.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === "popular") {
        return (b.votes_count || 0) - (a.votes_count || 0);
      } else if (sortBy === "most_solutions") {
        return (b.solutions_count || 0) - (a.solutions_count || 0);
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search challenges..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="most_solutions">Most Solutions</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterAgeGroup} onValueChange={setFilterAgeGroup}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Age Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Age Groups</SelectItem>
              <SelectItem value="60-65">60-65</SelectItem>
              <SelectItem value="65-70">65-70</SelectItem>
              <SelectItem value="70-75">70-75</SelectItem>
              <SelectItem value="75-80">75-80</SelectItem>
              <SelectItem value="80+">80+</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="United States">United States</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Tag filtering */}
      <div>
        <h3 className="text-sm font-medium mb-2">Filter by tags:</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              Select Tags
              {selectedTags.length > 0 && ` (${selectedTags.length})`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandList>
                <CommandEmpty>No tags found.</CommandEmpty>
                <CommandGroup>
                  {allTags.map(tag => (
                    <CommandItem
                      key={tag}
                      onSelect={() => handleSelectTag(tag)}
                      className="cursor-pointer"
                    >
                      <span className={selectedTags.includes(tag) ? "font-bold" : ""}>
                        {tag}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedTags.map(tag => (
              <TagBadge
                key={tag}
                text={tag}
                onClick={() => handleSelectTag(tag)}
                className="cursor-pointer hover:bg-red-100"
              />
            ))}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedTags([])}
              className="text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-pulse">Loading challenges...</div>
        </div>
      ) : filteredChallenges.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <p className="text-muted-foreground">
              No challenges match your search criteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredChallenges.map((challenge) => (
            <Card key={challenge.id} className="w-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">{challenge.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleVote(challenge.id, null, 'up')}
                      className={userVotes[challenge.id] === true ? "text-primary" : ""}
                    >
                      <ArrowUp size={18} />
                    </Button>
                    <span className="font-medium">{challenge.votes_count || 0}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleVote(challenge.id, null, 'down')}
                      className={userVotes[challenge.id] === false ? "text-primary" : ""}
                    >
                      <ArrowDown size={18} />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Posted on {new Date(challenge.created_at).toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">{challenge.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {challenge.tags && challenge.tags.map((tag) => (
                    <TagBadge key={tag} text={tag} />
                  ))}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                    <span>Age Group: {challenge.age_group}</span>
                    <span>Location: {challenge.location}</span>
                    <span>Mood: {challenge.mood}</span>
                  </div>
                </div>
                
                {/* Solutions Section - Only load when requested */}
                <Button 
                  variant="link" 
                  className="p-0 mt-3"
                  onClick={() => loadSolutions(challenge.id)}
                >
                  {challenge.solutions_count 
                    ? `View ${challenge.solutions_count} solutions`
                    : "No solutions yet - be the first to help!"}
                </Button>
                
                {solutions[challenge.id]?.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h3 className="font-medium">Solutions ({solutions[challenge.id].length})</h3>
                    {solutions[challenge.id].map((solution) => (
                      <div 
                        key={solution.id} 
                        className="bg-muted p-3 rounded-md flex justify-between items-start"
                      >
                        <div>
                          <p className="text-sm">{solution.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            By {solution.author_name || "Anonymous User"} • {new Date(solution.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-4">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleVote(challenge.id, solution.id, 'up')}
                            disabled={!user}
                          >
                            <ArrowUp size={16} className={userVotes[solution.id] === true ? "text-primary" : ""} />
                          </Button>
                          <span className="text-sm font-medium min-w-[24px] text-center">{solution.votes || 0}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleVote(challenge.id, solution.id, 'down')}
                            disabled={!user}
                          >
                            <ArrowDown size={16} className={userVotes[solution.id] === false ? "text-primary" : ""} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Popover 
                  open={openPopover === challenge.id} 
                  onOpenChange={() => {
                    if (!user) {
                      toast.error("You must be logged in to submit a solution");
                      return;
                    }
                    setOpenPopover(openPopover === challenge.id ? null : challenge.id);
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button variant="outline">Contribute a Solution</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium">Add Your Solution</h4>
                      <Textarea
                        value={newSolution}
                        onChange={(e) => setNewSolution(e.target.value)}
                        placeholder="Share your experience or advice..."
                        className="min-h-[100px]"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            setOpenPopover(null);
                            setNewSolution("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => handleSubmitSolution(challenge.id)}
                          disabled={loadingSolution}
                        >
                          {loadingSolution ? "Submitting..." : "Submit"}
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreChallenges;
