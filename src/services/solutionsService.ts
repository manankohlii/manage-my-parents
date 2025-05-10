
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Solution {
  id: string;
  challenge_id: string;
  user_id: string;
  text: string;
  created_at: string;
  updated_at: string;
  votes?: number;
  author_name?: string;
}

// Get solutions for a challenge
export const getSolutions = async (challengeId: string) => {
  try {
    const { data, error } = await supabase
      .from("solutions")
      .select("*")
      .eq("challenge_id", challengeId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // For each solution, get the vote count
    const enrichedSolutions = await Promise.all(
      data.map(async (solution) => {
        const { data: votes, error: votesError } = await supabase
          .from("solution_votes")
          .select("is_upvote")
          .eq("solution_id", solution.id);

        if (votesError) throw votesError;

        const votesCount = votes.reduce((acc, vote) => 
          vote.is_upvote ? acc + 1 : acc - 1, 0);

        // Try to get the author's display name
        let authorName = "Anonymous User";
        try {
          const { data: userData } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", solution.user_id)
            .maybeSingle();

          if (userData && userData.display_name) {
            authorName = userData.display_name;
          }
        } catch (error) {
          console.warn("Could not fetch author name", error);
        }

        return {
          ...solution,
          votes: votesCount,
          author_name: authorName
        };
      })
    );

    return enrichedSolutions;
  } catch (error) {
    console.error("Error fetching solutions:", error);
    toast.error("Failed to fetch solutions");
    return [];
  }
};

// Create a new solution
export const createSolution = async (
  challengeId: string, 
  text: string, 
  userId: string
) => {
  try {
    const { data, error } = await supabase
      .from("solutions")
      .insert({
        challenge_id: challengeId,
        user_id: userId,
        text
      })
      .select()
      .single();

    if (error) throw error;
    
    toast.success("Solution submitted successfully!");
    return data;
  } catch (error) {
    console.error("Error creating solution:", error);
    toast.error("Failed to submit solution");
    return null;
  }
};

// Vote on a solution
export const voteSolution = async (
  solutionId: string, 
  userId: string, 
  isUpvote: boolean
) => {
  try {
    // Check if the user has already voted
    const { data: existingVote, error: checkError } = await supabase
      .from("solution_votes")
      .select("*")
      .eq("solution_id", solutionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingVote) {
      // Update existing vote
      if (existingVote.is_upvote === isUpvote) {
        // If voting the same way, remove the vote
        const { error: deleteError } = await supabase
          .from("solution_votes")
          .delete()
          .eq("id", existingVote.id);

        if (deleteError) throw deleteError;
        
        toast.success("Vote removed");
      } else {
        // Change vote direction
        const { error: updateError } = await supabase
          .from("solution_votes")
          .update({ is_upvote: isUpvote })
          .eq("id", existingVote.id);

        if (updateError) throw updateError;
        
        toast.success(isUpvote ? "Upvoted!" : "Downvoted!");
      }
    } else {
      // Create new vote
      const { error: insertError } = await supabase
        .from("solution_votes")
        .insert({
          solution_id: solutionId,
          user_id: userId,
          is_upvote: isUpvote
        });

      if (insertError) throw insertError;
      
      toast.success(isUpvote ? "Upvoted!" : "Downvoted!");
    }

    return true;
  } catch (error) {
    console.error("Error voting on solution:", error);
    toast.error("Failed to register vote");
    return false;
  }
};
