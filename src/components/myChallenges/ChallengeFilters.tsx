import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ChallengeFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
}

const ChallengeFilters = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy
}: ChallengeFiltersProps) => {
  return (
    <div className="space-y-4">
      <Input
        placeholder="Search challenges..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md"
      />
      
      <div className="flex flex-wrap gap-4">
        <div className="space-y-1.5 min-w-[180px]">
          <Label htmlFor="sortBy">Sort by</Label>
          <Select
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger id="sortBy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="most_solutions">Most solutions</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ChallengeFilters;
