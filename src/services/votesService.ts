
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Vote on a challenge
export const voteChallenge = async (
  challengeId: string, 
  userId: string, 
  isUpvote: boolean
) => {
  try {
    // Check if the user has already voted
    const { data: existingVote, error: checkError } = await supabase
      .from("challenge_votes")
      .select("*")
      .eq("challenge_id", challengeId)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingVote) {
      // Update existing vote
      if (existingVote.is_upvote === isUpvote) {
        // If voting the same way, remove the vote
        const { error: deleteError } = await supabase
          .from("challenge_votes")
          .delete()
          .eq("id", existingVote.id);

        if (deleteError) throw deleteError;
        
        toast.success("Vote removed");
      } else {
        // Change vote direction
        const { error: updateError } = await supabase
          .from("challenge_votes")
          .update({ is_upvote: isUpvote })
          .eq("id", existingVote.id);

        if (updateError) throw updateError;
        
        toast.success(isUpvote ? "Upvoted!" : "Downvoted!");
      }
    } else {
      // Create new vote
      const { error: insertError } = await supabase
        .from("challenge_votes")
        .insert({
          challenge_id: challengeId,
          user_id: userId,
          is_upvote: isUpvote
        });

      if (insertError) throw insertError;
      
      toast.success(isUpvote ? "Upvoted!" : "Downvoted!");
    }

    return true;
  } catch (error) {
    console.error("Error voting on challenge:", error);
    toast.error("Failed to register vote");
    return false;
  }
};

// Get user's vote on a challenge
export const getUserChallengeVote = async (challengeId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("challenge_votes")
      .select("is_upvote")
      .eq("challenge_id", challengeId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    
    return data ? data.is_upvote : null;
  } catch (error) {
    console.error("Error getting user vote:", error);
    return null;
  }
};

// Get user's vote on a solution
export const getUserSolutionVote = async (solutionId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("solution_votes")
      .select("is_upvote")
      .eq("solution_id", solutionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    
    return data ? data.is_upvote : null;
  } catch (error) {
    console.error("Error getting user vote:", error);
    return null;
  }
};
