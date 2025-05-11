
import { Card } from "@/components/ui/card";
import { 
  TrendingUp, 
  MessageSquare,
  Users
} from "lucide-react";
import DashboardTabs from "@/components/DashboardTabs";
import { useState, useEffect, useContext } from "react";
import { TabContext } from "@/components/DashboardTabs";

const DashboardPage = () => {
  const [currentTabTitle, setCurrentTabTitle] = useState("My Challenges");
  const tabContext = useContext(TabContext);
  
  // Update page title based on active tab (now safely using hook at component level)
  useEffect(() => {
    if (tabContext) {
      // Get tab title based on active tab
      const getTitle = () => {
        switch (tabContext.activeTab) {
          case "my-challenges": return "My Challenges";
          case "add-challenge": return "Add New Challenge";
          case "explore": return "Explore Challenges";
          case "private-groups": return "Private Groups";
          default: return "My Challenges";
        }
      };
      setCurrentTabTitle(getTitle());
    }
  }, [tabContext?.activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Manage your challenges and explore the community</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <Card className="p-4 flex items-center space-x-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Challenges</p>
            <h3 className="text-2xl font-bold">24</h3>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center space-x-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Solutions Received</p>
            <h3 className="text-2xl font-bold">87</h3>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center space-x-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Community Size</p>
            <h3 className="text-2xl font-bold">1,234</h3>
          </div>
        </Card>
      </div>

      {/* Tabs Interface */}
      <DashboardTabs />
    </div>
  );
};

export default DashboardPage;
