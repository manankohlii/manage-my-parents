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

export const getGroupSolutions = async (groupChallengeId: string, userId?: string) => {
  // Fetch all group solutions for the challenge
  const { data: solutions, error: solutionsError } = await supabase
    .from("group_solutions")
    .select("*, profiles:profiles!fk_user_id(display_name)")
    .eq("group_challenge_id", groupChallengeId)
    .order("created_at", { ascending: false });
  if (solutionsError) throw solutionsError;
  if (!solutions || solutions.length === 0) return [];

  // Fetch all votes for these solutions
  const solutionIds = solutions.map((s: any) => s.id);
  const { data: votes, error: votesError } = await (supabase as any)
    .from("group_solution_votes")
    .select("group_solution_id, user_id, is_upvote")
    .in("group_solution_id", solutionIds);
  if (votesError) throw votesError;

  // Aggregate likes_count and user_vote
  return solutions.map((solution: any) => {
    const solutionVotes = votes?.filter((v: any) => v.group_solution_id === solution.id) || [];
    const likes_count = solutionVotes.filter((v: any) => v.is_upvote).length;
    const user_vote = userId
      ? (solutionVotes.find((v: any) => v.user_id === userId)?.is_upvote ?? null)
      : null;
    return {
      ...solution,
      display_name: solution.profiles?.display_name || "Anonymous User",
      likes_count,
      user_vote
    };
  });
};

export const deleteGroupSolution = async (solutionId: string) => {
  const { error } = await supabase
    .from("group_solutions" as any)
    .delete()
    .eq("id", solutionId);
  if (error) throw error;
  return true;
};

export const voteGroupSolution = async (
  groupSolutionId: string,
  userId: string,
  isUpvote: boolean
) => {
  // Check if the user has already voted
  const { data: existingVote, error: checkError } = await supabase
    .from("group_solution_votes")
    .select("*")
    .eq("group_solution_id", groupSolutionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (checkError) throw checkError;

  if (existingVote) {
    if (existingVote.is_upvote === isUpvote) {
      // Remove vote
      const { error: deleteError } = await supabase
        .from("group_solution_votes")
        .delete()
        .eq("id", existingVote.id);
      if (deleteError) throw deleteError;
      return null;
    } else {
      // Change vote direction
      const { error: updateError } = await supabase
        .from("group_solution_votes")
        .update({ is_upvote: isUpvote })
        .eq("id", existingVote.id);
      if (updateError) throw updateError;
      return isUpvote;
    }
  } else {
    // New vote
    const { error: insertError } = await supabase
      .from("group_solution_votes")
      .insert({
        group_solution_id: groupSolutionId,
        user_id: userId,
        is_upvote: isUpvote
      });
    if (insertError) throw insertError;
    return isUpvote;
  }
}; 