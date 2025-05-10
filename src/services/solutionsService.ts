
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
