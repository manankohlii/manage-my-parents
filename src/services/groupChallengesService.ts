import { supabase } from "@/integrations/supabase/client";

export interface GroupChallenge {
  id: string;
  group_id: string;
  user_id: string;
  title: string;
  description: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

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