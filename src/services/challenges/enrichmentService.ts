import { supabase } from "@/integrations/supabase/client";
import { Challenge } from "./types";

// Enrich challenges with tags, solution counts, and vote counts
export const enrichChallengeWithMetadata = async (challenge: any): Promise<Challenge> => {
  try {
    // Get tags for this challenge
    const { data: tagLinks, error: tagError } = await supabase
      .from("challenge_tags")
      .select("tag_id")
      .eq("challenge_id", challenge.id);

    if (tagError) throw tagError;

    const tagIds = tagLinks.map(link => link.tag_id);
    
    let tags: string[] = [];
    if (tagIds.length > 0) {
      const { data: tagData, error: tagNameError } = await supabase
        .from("tags")
        .select("name")
        .in("id", tagIds);

      if (tagNameError) throw tagNameError;
      tags = tagData.map(tag => tag.name);
    }

    // Count solutions for this challenge
    const { count: solutionsCount, error: solutionsError } = await supabase
      .from("solutions")
      .select("*", { count: 'exact', head: true })
      .eq("challenge_id", challenge.id);

    if (solutionsError) throw solutionsError;

    // Count votes for this challenge
    const { data: votes, error: votesError } = await supabase
      .from("challenge_votes")
      .select("is_upvote")
      .eq("challenge_id", challenge.id);

    if (votesError) throw votesError;

    // Calculate separate like and dislike counts
    const likesCount = votes.filter(vote => vote.is_upvote).length;
    const dislikesCount = votes.filter(vote => !vote.is_upvote).length;
    const votesCount = likesCount - dislikesCount;

    return {
      ...challenge,
      tags,
      solutions_count: solutionsCount || 0,
      votes_count: votesCount,
      likes_count: likesCount,
      dislikes_count: dislikesCount
    };
  } catch (error) {
    console.error("Error enriching challenge:", error);
    throw error;
  }
};

// Simpler enrichment for user challenges (no votes count)
export const enrichUserChallengeWithMetadata = async (challenge: any): Promise<Challenge> => {
  try {
    // Get tags for this challenge
    const { data: tagLinks, error: tagError } = await supabase
      .from("challenge_tags")
      .select("tag_id")
      .eq("challenge_id", challenge.id);

    if (tagError) throw tagError;

    const tagIds = tagLinks.map(link => link.tag_id);
    
    let tags: string[] = [];
    if (tagIds.length > 0) {
      const { data: tagData, error: tagNameError } = await supabase
        .from("tags")
        .select("name")
        .in("id", tagIds);

      if (tagNameError) throw tagNameError;
      tags = tagData.map(tag => tag.name);
    }

    // Count solutions for this challenge
    const { count: solutionsCount, error: solutionsError } = await supabase
      .from("solutions")
      .select("*", { count: 'exact', head: true })
      .eq("challenge_id", challenge.id);

    if (solutionsError) throw solutionsError;

    return {
      ...challenge,
      tags,
      solutions_count: solutionsCount || 0
    };
  } catch (error) {
    console.error("Error enriching user challenge:", error);
    throw error;
  }
};
