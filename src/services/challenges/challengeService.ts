
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Challenge, ChallengeInput } from "./types";
import { processTagsForChallenge, linkTagsToChallenge } from "./tagService";
import { enrichChallengeWithMetadata, enrichUserChallengeWithMetadata } from "./enrichmentService";

// Get all challenges with vote counts and tag names
export const getAllChallenges = async () => {
  try {
    // First get the challenges
    const { data: challenges, error } = await supabase
      .from("challenges")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Enrich challenges with tags, solution counts, and votes
    const enrichedChallenges = await Promise.all(
      challenges.map(async (challenge) => {
        return await enrichChallengeWithMetadata(challenge);
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
        mood: challengeData.mood,
        age_group: challengeData.age_group,
        location: challengeData.location,
        user_id: userId
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
