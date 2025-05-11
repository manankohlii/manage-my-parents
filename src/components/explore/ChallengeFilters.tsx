import { useState } from "react";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import TagBadge from "../TagBadge";

interface ChallengeFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  filterAgeGroup: string;
  setFilterAgeGroup: (group: string) => void;
  filterLocation: string;
  setFilterLocation: (location: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  allTags: string[];
}

const ChallengeFilters = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  filterAgeGroup,
  setFilterAgeGroup,
  filterLocation,
  setFilterLocation,
  selectedTags,
  setSelectedTags,
  allTags
}: ChallengeFiltersProps) => {
  
  const handleSelectTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  return (
    <>
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
              <SelectItem value="13-19">Teenagers (13-19)</SelectItem>
              <SelectItem value="20-34">Young Adults (20-34)</SelectItem>
              <SelectItem value="35-49">Adults (35-49)</SelectItem>
              <SelectItem value="50-64">Middle-aged (50-64)</SelectItem>
              <SelectItem value="65-79">Seniors (65-79)</SelectItem>
              <SelectItem value="80+">Elderly (80+)</SelectItem>
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
    </>
  );
};

export default ChallengeFilters;
