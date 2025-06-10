export interface Challenge {
  id: string;
  title: string;
  description: string;
  location: string;
  age_group: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  tags?: string[];
  solutions_count?: number;
  votes_count?: number;
  likes_count?: number;
  dislikes_count?: number;
}

export interface ChallengeInput {
  title: string;
  description: string;
  age_group: string;
  location: string;
  tags: string[];
}
