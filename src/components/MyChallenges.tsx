
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
import { getUserChallenges, deleteChallenge, Challenge } from "@/services/challengesService";

const MyChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [filterAgeGroup, setFilterAgeGroup] = useState("all");
  const [filterCountry, setFilterCountry] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadChallenges = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      const userChallenges = await getUserChallenges(user.id);
      setChallenges(userChallenges);
      setLoading(false);
    };

    loadChallenges();
  }, [user?.id]);

  const handleDeleteChallenge = async (id: string) => {
    const success = await deleteChallenge(id);
    if (success) {
      setChallenges(challenges.filter(challenge => challenge.id !== id));
    }
  };

  const handleEditChallenge = (id: string) => {
    // Navigate to edit challenge page or open a modal
    console.log(`Edit challenge ${id}`);
  };

  const filteredChallenges = challenges
    .filter(challenge => filterAgeGroup === "all" || challenge.age_group === filterAgeGroup)
    .filter(challenge => filterCountry === "all" || challenge.location === filterCountry)
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
              <SelectItem value="all">All Age Groups</SelectItem>
              <SelectItem value="60-65">60-65</SelectItem>
              <SelectItem value="65-70">65-70</SelectItem>
              <SelectItem value="70-75">70-75</SelectItem>
              <SelectItem value="75-80">75-80</SelectItem>
              <SelectItem value="80+">80+</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterCountry} onValueChange={setFilterCountry}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              <SelectItem value="United States">United States</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-pulse">Loading your challenges...</div>
        </div>
      ) : filteredChallenges.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <p className="text-muted-foreground">
              {challenges.length === 0 
                ? "You haven't created any challenges yet." 
                : "None of your challenges match the current filters."}
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
                  {challenge.tags && challenge.tags.map((tag) => (
                    <TagBadge key={tag} text={tag} />
                  ))}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Age Group: {challenge.age_group}</span>
                    <span>Location: {challenge.location}</span>
                    <span>Mood: {challenge.mood}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Posted on {new Date(challenge.created_at).toLocaleDateString()}
                </span>
                <Button variant="link" className="px-0">
                  View {challenge.solutions_count || 0} solutions
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
