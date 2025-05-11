
export interface Issue {
  id: string;
  title: string;
  description: string;
  userId: string;
  userName: string;
  createdAt: string;
  tags: string[];
  solutionCount: number;
}

// Mock issues data with parent-children themes
export const mockIssues: Issue[] = [
  {
    id: "issue1",
    title: "How to discuss screen time limits with teenagers?",
    description: "My teenager is constantly on their devices and I'm concerned about the impact on their sleep and social development. I'd like advice on how to set reasonable screen time limits without causing conflict.",
    userId: "user1",
    userName: "Sarah Johnson",
    createdAt: "2025-05-08T14:30:00",
    tags: ["teens", "screen-time", "boundaries"],
    solutionCount: 4
  },
  {
    id: "issue2",
    title: "Supporting a child through school anxiety",
    description: "My 9-year-old has developed anxiety about going to school. They complain of stomachaches every morning and sometimes cry when it's time to leave. How can I support them and reduce their anxiety?",
    userId: "user3",
    userName: "Emma Wilson",
    createdAt: "2025-05-09T11:15:00",
    tags: ["anxiety", "school", "emotional-support"],
    solutionCount: 3
  },
  {
    id: "issue3",
    title: "Handling sibling rivalry between young children",
    description: "I have a 4-year-old and a 6-year-old who are constantly competing for attention and fighting. I'm exhausted from mediating their conflicts. What strategies work for reducing sibling rivalry?",
    userId: "user2",
    userName: "Michael Chen",
    createdAt: "2025-05-10T09:45:00",
    tags: ["siblings", "conflict-resolution", "family-dynamics"],
    solutionCount: 2
  },
  {
    id: "issue4",
    title: "Talking to teens about dating and relationships",
    description: "My 15-year-old daughter seems interested in dating and I want to have open conversations about healthy relationships, but I'm not sure how to approach it without seeming intrusive or making her uncomfortable.",
    userId: "user4",
    userName: "David Kim",
    createdAt: "2025-05-07T16:20:00",
    tags: ["teens", "relationships", "communication"],
    solutionCount: 5
  }
];
