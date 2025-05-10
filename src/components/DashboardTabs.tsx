
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MyChallenges from "./MyChallenges";
import AddChallenge from "./AddChallenge";
import ExploreChallenges from "./ExploreChallenges";
import { Search, Plus, Filter } from "lucide-react";
import { createContext } from "react";

// Create TabContext
export const TabContext = createContext<{ setActiveTab: (tab: string) => void } | undefined>(undefined);

const DashboardTabs = () => {
  const [activeTab, setActiveTab] = useState("my-challenges");
  
  return (
    <TabContext.Provider value={{ setActiveTab }}>
      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger 
            value="my-challenges" 
            className="flex items-center gap-2 transition-colors text-white"
            style={{ 
              backgroundColor: activeTab === "my-challenges" ? "#0EA5E9" : "#38BDF8",
              filter: activeTab === "my-challenges" ? "brightness(100%)" : "brightness(85%)"
            }}
          >
            <Search className="text-current" size={16} />
            My Challenges
          </TabsTrigger>
          <TabsTrigger 
            value="add-challenge" 
            className="flex items-center gap-2 transition-colors text-white"
            style={{ 
              backgroundColor: activeTab === "add-challenge" ? "#10B981" : "#34D399",
              filter: activeTab === "add-challenge" ? "brightness(100%)" : "brightness(85%)"
            }}
          >
            <Plus className="text-current" size={16} />
            Add New Challenge
          </TabsTrigger>
          <TabsTrigger 
            value="explore" 
            className="flex items-center gap-2 transition-colors text-white"
            style={{ 
              backgroundColor: activeTab === "explore" ? "#8B5CF6" : "#A78BFA",
              filter: activeTab === "explore" ? "brightness(100%)" : "brightness(85%)"
            }}
          >
            <Filter className="text-current" size={16} />
            Explore Challenges
          </TabsTrigger>
        </TabsList>
        
        <TabsContent 
          value="my-challenges" 
          className="mt-6 bg-blue-500/20 dark:bg-blue-500/30 rounded-lg p-6 border-2 border-blue-500"
        >
          <MyChallenges />
        </TabsContent>
        
        <TabsContent 
          value="add-challenge" 
          className="mt-6 bg-green-500/20 dark:bg-green-500/30 rounded-lg p-6 border-2 border-green-500"
        >
          <AddChallenge />
        </TabsContent>
        
        <TabsContent 
          value="explore" 
          className="mt-6 bg-purple-500/20 dark:bg-purple-500/30 rounded-lg p-6 border-2 border-purple-500"
        >
          <ExploreChallenges />
        </TabsContent>
      </Tabs>
    </TabContext.Provider>
  );
};

export default DashboardTabs;
