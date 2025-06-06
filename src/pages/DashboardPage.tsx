import { Card } from "@/components/ui/card";
import { 
  TrendingUp, 
  MessageSquare,
  Users
} from "lucide-react";
import DashboardTabs from "@/components/DashboardTabs";
import { useState, useEffect, useContext } from "react";
import { TabContext } from "@/components/DashboardTabs";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardPage = () => {
  const [currentTabTitle, setCurrentTabTitle] = useState("My Challenges");
  const tabContext = useContext(TabContext);
  const { stats, loading: statsLoading } = useDashboardStats();
  
  // Update page title based on active tab (now safely using hook at component level)
  useEffect(() => {
    if (tabContext) {
      // Get tab title based on active tab
      const getTitle = () => {
        switch (tabContext.activeTab) {
          case "my-challenges": return "My Challenges";
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
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">Manage your challenges and explore the community</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="bg-primary/10 p-3 rounded-full">
            <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Challenges</p>
            {statsLoading ? (
              <Skeleton className="h-6 md:h-8 w-12" />
            ) : (
              <h3 className="text-xl md:text-2xl font-bold">{stats.totalChallenges}</h3>
            )}
          </div>
        </Card>
        
        <Card className="p-4 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="bg-primary/10 p-3 rounded-full">
            <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Solutions Received</p>
            {statsLoading ? (
              <Skeleton className="h-6 md:h-8 w-12" />
            ) : (
              <h3 className="text-xl md:text-2xl font-bold">{stats.solutionsReceived}</h3>
            )}
          </div>
        </Card>
        
        <Card className="p-4 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="bg-primary/10 p-3 rounded-full">
            <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Community Size</p>
            {statsLoading ? (
              <Skeleton className="h-6 md:h-8 w-12" />
            ) : (
              <h3 className="text-xl md:text-2xl font-bold">{stats.communitySize}</h3>
            )}
          </div>
        </Card>
      </div>

      {/* Tabs Interface */}
      <DashboardTabs />
    </div>
  );
};

export default DashboardPage;
