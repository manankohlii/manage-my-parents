
export interface Challenge {
  id: string;
  title: string;
  description: string;
  mood: string;
  location: string;
  age_group: string;  // Adding this property to match challengesService.ts
  created_at: string;
  updated_at: string;
  user_id: string;
  tags?: string[];
  solutions_count?: number;
  votes_count?: number;
}

export interface ChallengeInput {
  title: string;
  description: string;
  mood: string;
  location: string;
  tags: string[];
}
