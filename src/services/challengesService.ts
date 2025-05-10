
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Type definitions
export interface Challenge {
  id: string;
  title: string;
  description: string;
  mood: string;
  age_group: string;
  location: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  tags?: string[];
  solutions_count?: number;
  votes_count?: number;
}

interface ChallengeInput {
  title: string;
  description: string;
  mood: string;
  age_group: string;
  location: string;
  tags: string[];
}

// Get all challenges with vote counts and tag names
export const getAllChallenges = async () => {
  try {
    // First get the challenges
    const { data: challenges, error } = await supabase
      .from("challenges")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Get the tags for each challenge
    const enrichedChallenges = await Promise.all(
      challenges.map(async (challenge) => {
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

        const votesCount = votes.reduce((acc, vote) => 
          vote.is_upvote ? acc + 1 : acc - 1, 0);

        return {
          ...challenge,
          tags,
          solutions_count: solutionsCount || 0,
          votes_count: votesCount
        };
      })
    );

    return enrichedChallenges;
  } catch (error) {
    console.error("Error fetching challenges:", error);
    toast.error("Failed to fetch challenges");
    return [];
  }
};

// Get challenges for the current user
export const getUserChallenges = async (userId: string) => {
  try {
    // First get the challenges
    const { data: challenges, error } = await supabase
      .from("challenges")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Get the tags for each challenge
    const enrichedChallenges = await Promise.all(
      challenges.map(async (challenge) => {
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
      })
    );

    return enrichedChallenges;
  } catch (error) {
    console.error("Error fetching user challenges:", error);
    toast.error("Failed to fetch your challenges");
    return [];
  }
};

// Create a new challenge
export const createChallenge = async (challengeData: ChallengeInput, userId: string) => {
  try {
    // First insert the challenge
    const { data: challenge, error } = await supabase
      .from("challenges")
      .insert({
        title: challengeData.title,
        description: challengeData.description,
        mood: challengeData.mood,
        age_group: challengeData.age_group,
        location: challengeData.location,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;

    // Process tags - first ensure all tags exist
    const tagIds = await Promise.all(
      challengeData.tags.map(async (tagName) => {
        // Check if tag exists
        let { data: existingTag } = await supabase
          .from("tags")
          .select("id")
          .eq("name", tagName)
          .maybeSingle();

        if (!existingTag) {
          // Create the tag if it doesn't exist
          const { data: newTag, error } = await supabase
            .from("tags")
            .insert({ name: tagName })
            .select()
            .single();

          if (error) throw error;
          return newTag.id;
        }

        return existingTag.id;
      })
    );

    // Create associations between challenge and tags
    if (tagIds.length > 0) {
      const challengeTagsData = tagIds.map(tagId => ({
        challenge_id: challenge.id,
        tag_id: tagId
      }));

      const { error: tagLinkError } = await supabase
        .from("challenge_tags")
        .insert(challengeTagsData);

      if (tagLinkError) throw tagLinkError;
    }

    toast.success("Challenge created successfully!");
    return challenge;
  } catch (error) {
    console.error("Error creating challenge:", error);
    toast.error("Failed to create challenge");
    return null;
  }
};

// Delete a challenge
export const deleteChallenge = async (challengeId: string) => {
  try {
    const { error } = await supabase
      .from("challenges")
      .delete()
      .eq("id", challengeId);

    if (error) throw error;
    
    toast.success("Challenge deleted successfully!");
    return true;
  } catch (error) {
    console.error("Error deleting challenge:", error);
    toast.error("Failed to delete challenge");
    return false;
  }
};

// Get all available tags
export const getAllTags = async () => {
  try {
    const { data, error } = await supabase
      .from("tags")
      .select("name");

    if (error) throw error;
    
    return data.map(tag => tag.name);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
};
