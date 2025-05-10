
import { useState } from "react";
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

// Mock data for challenges
const mockCommunityChallenges = [
  {
    id: "1",
    title: "Managing medication schedule",
    description: "My mother often forgets to take her medication on time. What are some effective ways to help her remember?",
    tags: ["medication", "memory", "care"],
    mood: "concerned",
    createdAt: "2024-04-15T10:30:00Z",
    solutions: [
      { id: "s1", text: "We use a pill organizer with an alarm. It's been helpful for my dad.", votes: 12 },
      { id: "s2", text: "There are apps that remind both the caretaker and the patient about medication times.", votes: 8 },
    ],
    ageGroup: "70+",
    location: "United States",
    author: "Sarah M.",
    votes: 15
  },
  {
    id: "2",
    title: "Remote monitoring options",
    description: "I live far from my parents and worry about their wellbeing. What are good remote monitoring solutions that aren't intrusive?",
    tags: ["technology", "remote-care", "privacy"],
    mood: "worried",
    createdAt: "2024-05-01T09:15:00Z",
    solutions: [
      { id: "s3", text: "We use smart sensors that detect movement but don't record video. They alert me if there's no activity.", votes: 23 },
    ],
    ageGroup: "65-70",
    location: "Canada",
    author: "Michael T.",
    votes: 27
  },
  {
    id: "3",
    title: "Financial planning assistance",
    description: "My father is having trouble managing his finances since retirement. How can I help without taking over completely?",
    tags: ["finances", "independence", "retirement"],
    mood: "concerned",
    createdAt: "2024-05-05T14:45:00Z",
    solutions: [],
    ageGroup: "65-70",
    location: "United States",
    author: "Robert J.",
    votes: 5
  },
  {
    id: "4",
    title: "Transportation solutions",
    description: "My parents can no longer drive safely but still want independence. What transportation options work well for seniors?",
    tags: ["transportation", "independence", "safety"],
    mood: "hopeful",
    createdAt: "2024-05-08T11:20:00Z",
    solutions: [
      { id: "s4", text: "We use a rideshare service that's specifically for seniors. The drivers are trained to assist with mobility issues.", votes: 19 },
      { id: "s5", text: "Many communities have volunteer driver programs for seniors that are more affordable than taxis.", votes: 15 },
    ],
    ageGroup: "75-80",
    location: "Australia",
    author: "Emma L.",
    votes: 32
  },
];

// All unique tags from the mock data
const allTags = Array.from(
  new Set(
    mockCommunityChallenges.flatMap(challenge => challenge.tags)
  )
);

const ExploreChallenges = () => {
  const [challenges, setChallenges] = useState(mockCommunityChallenges);
  const [sortBy, setSortBy] = useState("popular");
  const [filterAgeGroup, setFilterAgeGroup] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [newSolution, setNewSolution] = useState("");

  const handleSubmitSolution = (challengeId: string) => {
    if (!newSolution.trim()) {
      toast.error("Solution cannot be empty");
      return;
    }

    // In a real app, you would save this to the database
    const updatedChallenges = challenges.map(challenge => {
      if (challenge.id === challengeId) {
        const newSolutionObj = {
          id: `s${Date.now()}`,
          text: newSolution,
          votes: 1, // Start with one vote (the creator's)
        };
        
        return {
          ...challenge,
          solutions: [...challenge.solutions, newSolutionObj]
        };
      }
      return challenge;
    });
    
    setChallenges(updatedChallenges);
    setNewSolution("");
    setOpenPopover(null);
    toast.success("Solution added successfully!");
  };

  const handleVote = (challengeId: string, solutionId: string | null, voteType: 'up' | 'down') => {
    const updatedChallenges = challenges.map(challenge => {
      if (challenge.id === challengeId) {
        if (solutionId) {
          // Vote on a solution
          return {
            ...challenge,
            solutions: challenge.solutions.map(solution => {
              if (solution.id === solutionId) {
                return {
                  ...solution,
                  votes: voteType === 'up' ? solution.votes + 1 : Math.max(0, solution.votes - 1)
                };
              }
              return solution;
            })
          };
        } else {
          // Vote on the challenge itself
          return {
            ...challenge,
            votes: voteType === 'up' ? challenge.votes + 1 : Math.max(0, challenge.votes - 1)
          };
        }
      }
      return challenge;
    });
    
    setChallenges(updatedChallenges);
    toast.success(`Vote ${voteType === 'up' ? 'added' : 'removed'} successfully!`);
  };

  const handleSelectTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const filteredChallenges = challenges
    .filter(challenge => !filterAgeGroup || challenge.ageGroup === filterAgeGroup)
    .filter(challenge => !filterLocation || challenge.location === filterLocation)
    .filter(challenge => {
      if (selectedTags.length === 0) return true;
      return selectedTags.some(tag => challenge.tags.includes(tag));
    })
    .filter(challenge => 
      !searchTerm || 
      challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "popular") {
        return b.votes - a.votes;
      } else if (sortBy === "most_solutions") {
        return b.solutions.length - a.solutions.length;
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

      {filteredChallenges.length === 0 ? (
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
                    >
                      <ArrowUp size={18} />
                    </Button>
                    <span className="font-medium">{challenge.votes}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleVote(challenge.id, null, 'down')}
                    >
                      <ArrowDown size={18} />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Posted by {challenge.author} on {new Date(challenge.createdAt).toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">{challenge.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {challenge.tags.map((tag) => (
                    <TagBadge key={tag} text={tag} />
                  ))}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                    <span>Age Group: {challenge.ageGroup}</span>
                    <span>Location: {challenge.location}</span>
                    <span>Mood: {challenge.mood}</span>
                  </div>
                </div>
                
                {/* Solutions Section */}
                {challenge.solutions.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h3 className="font-medium">Solutions ({challenge.solutions.length})</h3>
                    {challenge.solutions.map((solution) => (
                      <div 
                        key={solution.id} 
                        className="bg-muted p-3 rounded-md flex justify-between items-start"
                      >
                        <p className="text-sm">{solution.text}</p>
                        <div className="flex items-center space-x-1 ml-4">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => handleVote(challenge.id, solution.id, 'up')}
                          >
                            <ArrowUp size={16} />
                          </Button>
                          <span className="text-sm font-medium min-w-[24px] text-center">{solution.votes}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => handleVote(challenge.id, solution.id, 'down')}
                          >
                            <ArrowDown size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Popover open={openPopover === challenge.id} onOpenChange={() => setOpenPopover(openPopover === challenge.id ? null : challenge.id)}>
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
                        <Button onClick={() => handleSubmitSolution(challenge.id)}>
                          Submit
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
