import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type GroupChallenge = Database["public"]["Tables"]["group_challenges"]["Row"];

export const createGroupChallenge = async (
  groupId: string,
  userId: string,
  data: { title: string; description: string; tags: string[] }
) => {
  const { data: result, error } = await supabase
    .from("group_challenges")
    .insert({
      group_id: groupId,
      user_id: userId,
      title: data.title,
      description: data.description,
      tags: data.tags,
    })
    .select()
    .single();

  if (error) throw error;
  return result as GroupChallenge;
};

export const getGroupChallenges = async (groupId: string, userId?: string) => {
  // Step 1: Fetch all group challenges
  const { data: challenges, error: challengesError } = await supabase
    .from("group_challenges")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (challengesError) throw challengesError;

  if (!challenges || challenges.length === 0) return [];

  // Step 2: Fetch all votes for these challenges
  const challengeIds = challenges.map((c: any) => c.id);
  const { data: votes, error: votesError } = await (supabase as any)
    .from("group_challenge_votes")
    .select("group_challenge_id, user_id, is_upvote")
    .in("group_challenge_id", challengeIds);

  if (votesError) throw votesError;

  // Step 3: Aggregate likes_count and user_vote
  return challenges.map((challenge: any) => {
    const challengeVotes = votes?.filter((v: any) => v.group_challenge_id === challenge.id) || [];
    const likes_count = challengeVotes.filter((v: any) => v.is_upvote).length;
    const user_vote = userId
      ? (challengeVotes.find((v: any) => v.user_id === userId)?.is_upvote ?? null)
      : null;
    return {
      ...challenge,
      likes_count,
      user_vote
    };
  });
};

export const deleteGroupChallenge = async (challengeId: string) => {
  console.log("Deleting group challenge from Supabase:", challengeId);
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Error getting session:", sessionError);
      throw sessionError;
    }

    if (!session) {
      throw new Error("No authenticated session found");
    }

    console.log("Using session for deletion:", session.user.id);

    // Perform the deletion
    const { error } = await supabase
      .from("group_challenges")
      .delete()
      .eq("id", challengeId);

    if (error) {
      console.error("Supabase delete error:", error);
      throw error;
    }

    console.log("Challenge deleted successfully");
    return true;
  } catch (error) {
    console.error("Error in deleteGroupChallenge:", error);
    throw error;
  }
};

export const updateGroupChallenge = async (
  challengeId: string,
  data: { title: string; description: string; tags: string[] }
) => {
  console.log("Updating group challenge:", { challengeId, data });
  try {
    const { data: result, error } = await supabase
      .from("group_challenges")
      .update({
        title: data.title,
        description: data.description,
        tags: data.tags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", challengeId)
      .select()
      .single();

    if (error) {
      console.error("Error updating challenge:", error);
      throw error;
    }

    console.log("Challenge updated successfully:", result);
    return result as GroupChallenge;
  } catch (error) {
    console.error("Error in updateGroupChallenge:", error);
    throw error;
  }
};

export const voteGroupChallenge = async (
  groupChallengeId: string,
  userId: string,
  isUpvote: boolean
) => {
  // Check if the user has already voted
  const { data: existingVote, error: checkError } = await supabase
    .from("group_challenge_votes")
    .select("*")
    .eq("group_challenge_id", groupChallengeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (checkError) throw checkError;

  if (existingVote) {
    if (existingVote.is_upvote === isUpvote) {
      // Remove vote
      const { error: deleteError } = await supabase
        .from("group_challenge_votes")
        .delete()
        .eq("id", existingVote.id);
      if (deleteError) throw deleteError;
      return null;
    } else {
      // Change vote direction
      const { error: updateError } = await supabase
        .from("group_challenge_votes")
        .update({ is_upvote: isUpvote })
        .eq("id", existingVote.id);
      if (updateError) throw updateError;
      return isUpvote;
    }
  } else {
    // New vote
    const { error: insertError } = await supabase
      .from("group_challenge_votes")
      .insert({
        group_challenge_id: groupChallengeId,
        user_id: userId,
        is_upvote: isUpvote
      });
    if (insertError) throw insertError;
    return isUpvote;
  }
}; 