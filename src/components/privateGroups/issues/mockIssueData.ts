
// Here I'll update the mock data to match what we've added to Supabase
import { v4 as uuidv4 } from 'uuid';

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

export interface IssueSolution {
  id: string;
  issueId: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: string;
  votes: number;
}

// Generate fixed IDs for consistency
const issueId1 = '12345678-1234-1234-1234-123456789001';
const issueId2 = '12345678-1234-1234-1234-123456789002';
const issueId3 = '12345678-1234-1234-1234-123456789003';
const issueId4 = '12345678-1234-1234-1234-123456789004';
const issueId5 = '12345678-1234-1234-1234-123456789005';

export const mockIssues: Issue[] = [
  {
    id: issueId1,
    title: "How to discuss screen time limits with teenagers?",
    description: "My teenager is constantly on their devices and I'm concerned about the impact on their sleep and social development. I'd like advice on how to set reasonable screen time limits without causing conflict.",
    userId: "user-001",
    userName: "ConcernedParent",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["teens", "screen-time", "boundaries"],
    solutionCount: 1
  },
  {
    id: issueId2,
    title: "Supporting a child through school anxiety",
    description: "My 9-year-old has developed anxiety about going to school. They complain of stomachaches every morning and sometimes cry when it's time to leave. How can I support them and reduce their anxiety?",
    userId: "user-002",
    userName: "WorriedMom",
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["anxiety", "school", "emotional-support"],
    solutionCount: 2
  },
  {
    id: issueId3,
    title: "Handling sibling rivalry between young children",
    description: "I have a 4-year-old and a 6-year-old who are constantly competing for attention and fighting. I'm exhausted from mediating their conflicts. What strategies work for reducing sibling rivalry?",
    userId: "user-003",
    userName: "ExhaustedDad",
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["siblings", "conflict-resolution", "family-dynamics"],
    solutionCount: 3
  },
  {
    id: issueId4,
    title: "Talking to teens about dating and relationships",
    description: "My 15-year-old daughter seems interested in dating and I want to have open conversations about healthy relationships, but I'm not sure how to approach it without seeming intrusive or making her uncomfortable.",
    userId: "user-004",
    userName: "CautiousFather",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["teens", "relationships", "communication"],
    solutionCount: 0
  },
  {
    id: issueId5,
    title: "Getting toddler to sleep in own bed",
    description: "My 3-year-old keeps climbing into our bed in the middle of the night. We're all exhausted from poor sleep. How can I gently encourage them to stay in their own bed all night?",
    userId: "user-005",
    userName: "SleepDeprived",
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["toddlers", "bedtime", "discipline"],
    solutionCount: 4
  }
];

export const mockSolutions: Record<string, IssueSolution[]> = {
  [issueId1]: [
    {
      id: uuidv4(),
      issueId: issueId1,
      text: "One approach that worked for us was creating a 'technology contract' together. We sat down with our teen and jointly established rules about screen time, including limits, device-free zones (like dinner table and bedrooms), and screen-free hours before bed. By involving them in creating the rules, they felt ownership and were more likely to follow them.",
      userId: "user-006",
      userName: "BalancedTechParent",
      createdAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
      votes: 12
    }
  ],
  [issueId2]: [
    {
      id: uuidv4(),
      issueId: issueId2,
      text: "As a teacher, I see this often. Consider talking to the school counselor about implementing a 'morning check-in' where your child can visit briefly when arriving to share any concerns. This provides reassurance that there's support at school.",
      userId: "user-007",
      userName: "ElementaryTeacher",
      createdAt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(),
      votes: 8
    },
    {
      id: uuidv4(),
      issueId: issueId2,
      text: "We found that a consistent morning routine with a visual schedule helped our anxious child. We also gave him a small comfort item to keep in his pocket during the day.",
      userId: "user-008",
      userName: "CalmMomma",
      createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
      votes: 5
    }
  ]
};
