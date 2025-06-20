import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Challenge, ChallengeInput } from "./types";
import { processTagsForChallenge, linkTagsToChallenge } from "./tagService";
import { enrichChallengeWithMetadata, enrichUserChallengeWithMetadata } from "./enrichmentService";

// Get all challenges with vote counts and tag names
export const getAllChallenges = async () => {
  try {
    // First get the challenges with display_name from profiles
    const { data: challenges, error } = await supabase
      .from("challenges")
      .select("*, profile:profiles(display_name)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Enrich challenges with tags, solution counts, and votes
    const enrichedChallenges = await Promise.all(
      challenges.map(async (challenge) => {
        const enriched = await enrichChallengeWithMetadata(challenge);
        return {
          ...enriched,
          display_name: challenge.profile?.display_name || "Anonymous User"
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

    // Enrich challenges with tags and solution counts
    const enrichedChallenges = await Promise.all(
      challenges.map(async (challenge) => {
        return await enrichUserChallengeWithMetadata(challenge);
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
        age_group: challengeData.age_group,
        location: challengeData.location,
        user_id: userId,
        tags: challengeData.tags
      })
      .select()
      .single();

    if (error) throw error;

    // Process tags and create associations
    const tagIds = await processTagsForChallenge(challengeData.tags);
    await linkTagsToChallenge(challenge.id, tagIds);

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

// Update an existing challenge
export const updateChallenge = async (challengeId: string, challengeData: ChallengeInput) => {
  try {
    // First update the challenge
    const { data: challenge, error } = await supabase
      .from("challenges")
      .update({
        title: challengeData.title,
        description: challengeData.description,
        age_group: challengeData.age_group,
        location: challengeData.location,
        tags: challengeData.tags,
        updated_at: new Date().toISOString()
      })
      .eq("id", challengeId)
      .select()
      .single();

    if (error) throw error;

    // Delete existing tag associations
    const { error: deleteError } = await supabase
      .from("challenge_tags")
      .delete()
      .eq("challenge_id", challengeId);

    if (deleteError) throw deleteError;

    // Process tags and create new associations
    const tagIds = await processTagsForChallenge(challengeData.tags);
    await linkTagsToChallenge(challengeId, tagIds);

    toast.success("Challenge updated successfully!", {
      duration: 2000 // Show for 2 seconds
    });
    return challenge;
  } catch (error) {
    console.error("Error updating challenge:", error);
    toast.error("Failed to update challenge", {
      duration: 2000 // Show for 2 seconds
    });
    return null;
  }
};
