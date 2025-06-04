import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardStats {
  totalChallenges: number;
  solutionsReceived: number;
  communitySize: number;
}

export const useDashboardStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalChallenges: 0,
    solutionsReceived: 0,
    communitySize: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        // Get total challenges count across all users
        const { count: challengesCount } = await supabase
          .from("challenges")
          .select("*", { count: 'exact', head: true });

        // Get total solutions count across all challenges
        const { count: solutionsCount } = await supabase
          .from("solutions")
          .select("*", { count: 'exact', head: true });

        // Get total community size (number of registered users)
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: 'exact', head: true });

        setStats({
          totalChallenges: challengesCount || 0,
          solutionsReceived: solutionsCount || 0,
          communitySize: usersCount || 0
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  return { stats, loading };
};
