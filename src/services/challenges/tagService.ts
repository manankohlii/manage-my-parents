
import { supabase } from "@/integrations/supabase/client";

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

// Process tags - ensure they exist and return their IDs
export const processTagsForChallenge = async (tags: string[]): Promise<string[]> => {
  try {
    return await Promise.all(
      tags.map(async (tagName) => {
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
  } catch (error) {
    console.error("Error processing tags:", error);
    throw error;
  }
};

// Create associations between challenge and tags
export const linkTagsToChallenge = async (challengeId: string, tagIds: string[]) => {
  if (tagIds.length === 0) return;
  
  try {
    const challengeTagsData = tagIds.map(tagId => ({
      challenge_id: challengeId,
      tag_id: tagId
    }));

    const { error } = await supabase
      .from("challenge_tags")
      .insert(challengeTagsData);

    if (error) throw error;
  } catch (error) {
    console.error("Error linking tags to challenge:", error);
    throw error;
  }
};
