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
            <TabsList className="w-full mb-6 md:mb-8 bg-transparent inline-flex min-w-full sm:min-w-0 sm:w-auto gap-2 sm:gap-4">
              <TabsTrigger value="my-challenges" className="flex items-center gap-2 whitespace-nowrap">
                <Search className="text-current shrink-0" size={16} />
                <span>My Challenges</span>
              </TabsTrigger>
              <TabsTrigger value="explore" className="flex items-center gap-2 whitespace-nowrap">
                <Filter className="text-current shrink-0" size={16} />
                <span>Explore</span>
              </TabsTrigger>
              <TabsTrigger value="private-groups" className="flex items-center gap-2 whitespace-nowrap">
                <Users className="text-current shrink-0" size={16} />
                <span>Groups</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="my-challenges" className="mt-4 md:mt-6 bg-blue-500/10 rounded-lg p-4 md:p-6 border border-blue-200 dark:border-blue-900 dark:bg-blue-500/20">
          <MyChallenges />
        </TabsContent>
        
        <TabsContent value="explore" className="mt-4 md:mt-6 bg-purple-500/10 rounded-lg p-4 md:p-6 border border-purple-200 dark:border-purple-900 dark:bg-purple-500/20">
          <ExploreChallenges />
        </TabsContent>
        
        <TabsContent value="private-groups" className="mt-4 md:mt-6 bg-indigo-500/10 rounded-lg p-4 md:p-6 border border-indigo-200 dark:border-indigo-900 dark:bg-indigo-500/20">
          <PrivateGroups />
        </TabsContent>
      </Tabs>
    </TabContext.Provider>
  );
};

export default DashboardTabs;
