
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
        // Get user's total challenges count
        const { count: challengesCount } = await supabase
          .from("challenges")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", user.id);

        // Get total solutions received on user's challenges
        const { data: userChallenges } = await supabase
          .from("challenges")
          .select("id")
          .eq("user_id", user.id);

        let solutionsCount = 0;
        if (userChallenges && userChallenges.length > 0) {
          const challengeIds = userChallenges.map(c => c.id);
          const { count: solutions } = await supabase
            .from("solutions")
            .select("*", { count: 'exact', head: true })
            .in("challenge_id", challengeIds);
          
          solutionsCount = solutions || 0;
        }

        // Get total community size (number of registered users)
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: 'exact', head: true });

        setStats({
          totalChallenges: challengesCount || 0,
          solutionsReceived: solutionsCount,
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
