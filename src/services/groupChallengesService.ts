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

export const getGroupChallenges = async (groupId: string) => {
  const { data, error } = await supabase
    .from("group_challenges")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as GroupChallenge[];
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