
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
  const [showAllTags, setShowAllTags] = useState(false);
  
  // Show 5 most common tags by default, or all when expanded
  const visibleTags = showAllTags ? allTags : allTags.slice(0, 5);
  const hasMoreTags = allTags.length > 5;

  return (
    <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:gap-3 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search issues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <div className="flex flex-col space-y-2 w-full sm:w-auto">
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={filterTag === '' ? 'default' : 'outline'} 
            className="cursor-pointer"
            onClick={() => setFilterTag('')}
          >
            All
          </Badge>
          
          {visibleTags.map(tag => (
            <Badge 
              key={tag} 
              variant={filterTag === tag ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilterTag(tag)}
            >
              {tag}
            </Badge>
          ))}
          
          {hasMoreTags && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAllTags(!showAllTags)}
              className="text-xs h-6 px-2"
            >
              {showAllTags ? 'Show Less' : `+${allTags.length - 5} more`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueFilter;
