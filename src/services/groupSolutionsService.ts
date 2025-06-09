import { supabase } from "@/integrations/supabase/client";

export interface GroupSolution {
  id: string;
  group_challenge_id: string;
  user_id: string;
  text: string;
  created_at: string;
  updated_at: string;
  display_name?: string;
}

export const createGroupSolution = async (
  groupChallengeId: string,
  userId: string,
  text: string
) => {
  const { data, error } = await supabase
    .from("group_solutions" as any)
    .insert({
      group_challenge_id: groupChallengeId,
      user_id: userId,
      text,
    })
    .select()
    .single();
  if (error) throw error;
  return data as GroupSolution;
};

export const getGroupSolutions = async (groupChallengeId: string) => {
  const { data, error } = await supabase
    .from("group_solutions")
    .select("*, profile:profiles(display_name)")
    .eq("group_challenge_id", groupChallengeId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as any[]).map(sol => ({
    ...sol,
    display_name: sol.profile?.display_name || "Anonymous User"
  }));
};

export const deleteGroupSolution = async (solutionId: string) => {
  const { error } = await supabase
    .from("group_solutions" as any)
    .delete()
    .eq("id", solutionId);
  if (error) throw error;
  return true;
}; 