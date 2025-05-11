
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface IssueFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterTag: string;
  setFilterTag: (tag: string) => void;
  allTags: string[];
}

const IssueFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  filterTag, 
  setFilterTag, 
  allTags 
}: IssueFilterProps) => {
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search issues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <select 
        className="border rounded px-3 py-2"
        value={filterTag}
        onChange={(e) => setFilterTag(e.target.value)}
      >
        <option value="">All Tags</option>
        {allTags.map(tag => (
          <option key={tag} value={tag}>{tag}</option>
        ))}
      </select>
    </div>
  );
};

export default IssueFilter;
