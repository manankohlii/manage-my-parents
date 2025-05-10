
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ChallengeFiltersProps = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  filterAgeGroup: string;
  setFilterAgeGroup: (ageGroup: string) => void;
  filterCountry: string;
  setFilterCountry: (country: string) => void;
};

const ChallengeFilters = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  filterAgeGroup,
  setFilterAgeGroup,
  filterCountry,
  setFilterCountry,
}: ChallengeFiltersProps) => {
  return (
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
  );
};

export default ChallengeFilters;
