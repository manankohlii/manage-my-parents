import { supabase } from "@/integrations/supabase/client";

export interface GroupSolution {
  id: string;
  group_challenge_id: string;
  user_id: string;
  text: string;
  created_at: string;
  updated_at: string;
  display_name?: string;
  parent_solution_id?: string;
}

export const createGroupSolution = async (
  groupChallengeId: string,
  userId: string,
  text: string,
  parentSolutionId?: string
) => {
  const { data, error } = await supabase
    .from("group_solutions" as any)
    .insert({
      group_challenge_id: groupChallengeId,
      user_id: userId,
      text,
      parent_solution_id: parentSolutionId || null
    })
    .select("*, profiles:profiles!fk_user_id(display_name)")
    .single();
  if (error) throw error;
  if (!data) return null;
  return {
    ...data,
    display_name: data && data.profiles && data.profiles.display_name ? data.profiles.display_name : "Anonymous User"
  } as GroupSolution;
};

export const getGroupSolutions = async (groupChallengeId: string) => {
  const { data, error } = await supabase
    .from("group_solutions")
    .select("*, profiles:profiles!fk_user_id(display_name)")
    .eq("group_challenge_id", groupChallengeId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!Array.isArray(data)) return [];
  return data.map((sol: any) => ({
    ...sol,
    display_name: sol && sol.profiles && sol.profiles.display_name ? sol.profiles.display_name : "Anonymous User"
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