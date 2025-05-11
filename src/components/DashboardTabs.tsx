
import { useState, createContext } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MyChallenges from "./MyChallenges";
import AddChallenge from "./AddChallenge";
import ExploreChallenges from "./ExploreChallenges";
import { Search, Plus, Filter } from "lucide-react";

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
      case "add-challenge": return "Add New Challenge";
      case "explore": return "Explore Challenges";
      default: return "My Challenges";
    }
  };
  
  return (
    <TabContext.Provider value={{ setActiveTab, activeTab }}>
      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full mb-8 bg-transparent">
          <TabsTrigger value="my-challenges" className="flex items-center gap-2">
            <Search className="text-current" size={16} />
            My Challenges
          </TabsTrigger>
          <TabsTrigger value="add-challenge" className="flex items-center gap-2">
            <Plus className="text-current" size={16} />
            Add New Challenge
          </TabsTrigger>
          <TabsTrigger value="explore" className="flex items-center gap-2">
            <Filter className="text-current" size={16} />
            Explore Challenges
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-challenges" className="mt-6 bg-blue-500/10 rounded-lg p-6 border border-blue-200 dark:border-blue-900 dark:bg-blue-500/20">
          <MyChallenges />
        </TabsContent>
        
        <TabsContent value="add-challenge" className="mt-6 bg-green-500/10 rounded-lg p-6 border border-green-200 dark:border-green-900 dark:bg-green-500/20">
          <AddChallenge />
        </TabsContent>
        
        <TabsContent value="explore" className="mt-6 bg-purple-500/10 rounded-lg p-6 border border-purple-200 dark:border-purple-900 dark:bg-purple-500/20">
          <ExploreChallenges />
        </TabsContent>
      </Tabs>
    </TabContext.Provider>
  );
};

export default DashboardTabs;
