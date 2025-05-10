
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import TagBadge from "./TagBadge";
import { Search, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Mock data for challenges
const mockUserChallenges = [
  {
    id: "1",
    title: "Managing medication schedule",
    description: "My mother often forgets to take her medication on time. What are some effective ways to help her remember?",
    tags: ["medication", "memory", "care"],
    mood: "concerned",
    createdAt: "2024-04-15T10:30:00Z",
    solutions: 3,
    ageGroup: "70+",
    location: "United States"
  },
  {
    id: "2",
    title: "Remote monitoring options",
    description: "I live far from my parents and worry about their wellbeing. What are good remote monitoring solutions that aren't intrusive?",
    tags: ["technology", "remote-care", "privacy"],
    mood: "worried",
    createdAt: "2024-05-01T09:15:00Z",
    solutions: 5,
    ageGroup: "65-70",
    location: "Canada"
  },
  {
    id: "3",
    title: "Financial planning assistance",
    description: "My father is having trouble managing his finances since retirement. How can I help without taking over completely?",
    tags: ["finances", "independence", "retirement"],
    mood: "concerned",
    createdAt: "2024-05-05T14:45:00Z",
    solutions: 2,
    ageGroup: "65-70",
    location: "United States"
  }
];

const MyChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState(mockUserChallenges);
  const [sortBy, setSortBy] = useState("newest");
  const [filterAgeGroup, setFilterAgeGroup] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleDeleteChallenge = (id: string) => {
    setChallenges(challenges.filter(challenge => challenge.id !== id));
    // In a real app, you would delete the challenge from the database
  };

  const handleEditChallenge = (id: string) => {
    // Navigate to edit challenge page or open a modal
    console.log(`Edit challenge ${id}`);
  };

  const filteredChallenges = challenges
    .filter(challenge => !filterAgeGroup || challenge.ageGroup === filterAgeGroup)
    .filter(challenge => !filterCountry || challenge.location === filterCountry)
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
      } else if (sortBy === "most_solutions") {
        return b.solutions - a.solutions;
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search your challenges..." 
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
              <SelectItem value="">All Age Groups</SelectItem>
              <SelectItem value="60-65">60-65</SelectItem>
              <SelectItem value="65-70">65-70</SelectItem>
              <SelectItem value="70+">70+</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterCountry} onValueChange={setFilterCountry}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Countries</SelectItem>
              <SelectItem value="United States">United States</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredChallenges.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <p className="text-muted-foreground">
              You haven't created any challenges yet or none match your filters.
            </p>
            <Button variant="default" className="mt-4">Create Your First Challenge</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredChallenges.map((challenge) => (
            <Card key={challenge.id} className="w-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{challenge.title}</CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditChallenge(challenge.id)}
                    >
                      <Edit size={18} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteChallenge(challenge.id)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
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
                  <div className="flex items-center justify-between">
                    <span>Age Group: {challenge.ageGroup}</span>
                    <span>Location: {challenge.location}</span>
                    <span>Mood: {challenge.mood}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Posted on {new Date(challenge.createdAt).toLocaleDateString()}
                </span>
                <Button variant="link" className="px-0">
                  View {challenge.solutions} solutions
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyChallenges;
