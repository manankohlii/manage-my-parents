
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
          <TabsTrigger value="my-challenges" className="flex items-center gap-2">
            <Search className={activeTab === "my-challenges" ? "text-primary" : ""} size={16} />
            My Challenges
          </TabsTrigger>
          <TabsTrigger value="add-challenge" className="flex items-center gap-2">
            <Plus className={activeTab === "add-challenge" ? "text-primary" : ""} size={16} />
            Add New Challenge
          </TabsTrigger>
          <TabsTrigger value="explore" className="flex items-center gap-2">
            <Filter className={activeTab === "explore" ? "text-primary" : ""} size={16} />
            Explore Challenges
          </TabsTrigger>
        </TabsList>
        
        <TabsContent 
          value="my-challenges" 
          className="mt-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg p-6"
        >
          <MyChallenges />
        </TabsContent>
        
        <TabsContent 
          value="add-challenge" 
          className="mt-6 bg-green-50 dark:bg-green-950/20 rounded-lg p-6"
        >
          <AddChallenge />
        </TabsContent>
        
        <TabsContent 
          value="explore" 
          className="mt-6 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-6"
        >
          <ExploreChallenges />
        </TabsContent>
      </Tabs>
    </TabContext.Provider>
  );
};

export default DashboardTabs;
