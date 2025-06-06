import { useState, createContext } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MyChallenges from "./MyChallenges";
import ExploreChallenges from "./ExploreChallenges";
import PrivateGroups from "./privateGroups/PrivateGroups";
import { Search, Filter, Users } from "lucide-react";

// Create TabContext
export const TabContext = createContext<{ 
  setActiveTab: (tab: string) => void;
  activeTab: string;
} | undefined>(undefined);

const DashboardTabs = () => {
  const [activeTab, setActiveTab] = useState("my-challenges");
  
  const getTabTitle = () => {
    switch (activeTab) {
      case "my-challenges": return "My Challenges";
      case "explore": return "Explore Challenges";
      case "private-groups": return "Private Groups";
      default: return "My Challenges";
    }
  };
  
  return (
    <TabContext.Provider value={{ setActiveTab, activeTab }}>
      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <div className="relative">
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="w-full mb-6 md:mb-8 bg-transparent grid grid-cols-3 gap-2 sm:gap-4">
              <TabsTrigger value="my-challenges" className="flex items-center justify-center gap-2 whitespace-nowrap">
                <Search className="text-current shrink-0" size={16} />
                <span className="hidden sm:inline">My Challenges</span>
                <span className="sm:hidden">My</span>
              </TabsTrigger>
              <TabsTrigger value="explore" className="flex items-center justify-center gap-2 whitespace-nowrap">
                <Filter className="text-current shrink-0" size={16} />
                <span className="hidden sm:inline">Explore</span>
                <span className="sm:hidden">Explore</span>
              </TabsTrigger>
              <TabsTrigger value="private-groups" className="flex items-center justify-center gap-2 whitespace-nowrap">
                <Users className="text-current shrink-0" size={16} />
                <span className="hidden sm:inline">Groups</span>
                <span className="sm:hidden">Groups</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="my-challenges" className="mt-4 md:mt-6 bg-blue-500/10 rounded-lg p-4 md:p-6 border border-blue-200 dark:border-blue-900 dark:bg-blue-500/20">
          <MyChallenges />
        </TabsContent>
        
        <TabsContent value="explore" className="mt-4 md:mt-6 bg-blue-500/10 rounded-lg p-4 md:p-6 border border-blue-200 dark:border-blue-900 dark:bg-blue-500/20">
          <ExploreChallenges />
        </TabsContent>
        
        <TabsContent value="private-groups" className="mt-4 md:mt-6 bg-blue-500/10 rounded-lg p-4 md:p-6 border border-blue-200 dark:border-blue-900 dark:bg-blue-500/20">
          <PrivateGroups />
        </TabsContent>
      </Tabs>
    </TabContext.Provider>
  );
};

export default DashboardTabs;
