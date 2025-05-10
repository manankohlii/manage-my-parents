
// Mock data for posts
export const mockPosts = [
  {
    id: "1",
    title: "How do I talk to my parents about therapy?",
    content: "I've been struggling with anxiety for a while now and I think therapy would really help me. However, my parents are from a generation/culture that doesn't really 'believe' in mental health issues. They think I should just 'toughen up' or 'think positive'. How can I approach this conversation in a way they might understand?",
    author: {
      name: "AnxiousTeen",
      avatar: "",
    },
    tags: ["communication", "mental-health", "therapy", "generational-gap"],
    likes: 45,
    comments: 12,
    createdAt: "2 days ago",
    isSolved: false,
  },
  {
    id: "2",
    title: "Parents still treat me like a child at 25",
    content: "I'm 25, have a good job, my own apartment, and pay all my own bills. Yet every time I visit home, my parents still treat me like I'm 16. They question my decisions, try to set curfews, and get upset when I make plans without consulting them. How can I establish adult boundaries without hurting their feelings?",
    author: {
      name: "AdultingHard",
      avatar: "",
    },
    tags: ["boundaries", "independence", "adult-children", "respect"],
    likes: 78,
    comments: 23,
    createdAt: "1 week ago",
    isSolved: true,
  },
  {
    id: "3",
    title: "Dad doesn't respect my career choice",
    content: "I recently graduated with a degree in digital arts and got a job as a graphic designer. My dad keeps making comments about how I should get a 'real job' in business or law like he did. He introduces me to his friends by saying 'still trying to figure things out' even though I have a stable job I love. How do I get him to respect my career path?",
    author: {
      name: "CreativeSpirit",
      avatar: "",
    },
    tags: ["career", "respect", "arts", "validation"],
    likes: 56,
    comments: 18,
    createdAt: "3 days ago",
    isSolved: false,
  },
  {
    id: "4",
    title: "How to introduce my same-sex partner to traditional parents?",
    content: "I'm planning to bring my partner home to meet my family during the holidays, but my parents are very traditional and religious. They know I'm gay but we've never really discussed it openly. Any advice on how to make this introduction go smoothly? I want them to see how happy we are together.",
    author: {
      name: "LoveIsLove",
      avatar: "",
    },
    tags: ["lgbtq", "relationships", "acceptance", "family-gathering"],
    likes: 92,
    comments: 34,
    createdAt: "5 days ago",
    isSolved: false,
  },
  {
    id: "5",
    title: "Parents want to move in with me as they age",
    content: "My parents are getting older (70s) and have started hinting that they expect to move in with me in the next few years. While I love them, I have a small home, a demanding career, and honestly don't think I could be their caretaker. How do I have this conversation without seeming like I'm abandoning them?",
    author: {
      name: "SandwichGeneration",
      avatar: "",
    },
    tags: ["aging-parents", "boundaries", "caretaking", "difficult-conversations"],
    likes: 63,
    comments: 29,
    createdAt: "2 weeks ago",
    isSolved: true,
  },
  {
    id: "6",
    title: "Mom keeps comparing me to my siblings",
    content: "My mom constantly compares me to my siblings, especially regarding academic achievements. My brother and sister were both straight-A students, while I struggle with ADHD and have different strengths. Every conversation somehow turns into 'why can't you be more like them?' How can I get her to see my value beyond grades?",
    author: {
      name: "MiddleChild",
      avatar: "",
    },
    tags: ["sibling-comparison", "self-worth", "academic-pressure", "adhd"],
    likes: 41,
    comments: 15,
    createdAt: "1 day ago",
    isSolved: false,
  },
  {
    id: "7",
    title: "Parents disapprove of my interracial relationship",
    content: "I've been dating my partner for two years now and we're getting serious, but my parents make uncomfortable comments about our cultural differences. They won't directly say they disapprove, but they constantly hint at how 'life would be easier' with someone from our own background. How can we bridge this gap?",
    author: {
      name: "LoveAcrossCultures",
      avatar: "",
    },
    tags: ["interracial-relationship", "cultural-differences", "acceptance", "prejudice"],
    likes: 87,
    comments: 26,
    createdAt: "4 days ago",
    isSolved: false,
  }
];

// Mock data for comments
export const mockComments = [
  {
    id: "c1",
    postId: "1",
    author: {
      name: "TherapistHelper",
      avatar: "",
    },
    content: "I went through something similar with my parents. What helped was framing therapy as 'skill building' rather than 'fixing something wrong.' I explained it as similar to having a coach for sports or a tutor for school - it's about improving and learning techniques to handle life better. Also, maybe share some statistics about how common anxiety is these days, especially among young people.",
    likes: 12,
    createdAt: "1 day ago",
  },
  {
    id: "c2",
    postId: "1",
    author: {
      name: "PsychMajor",
      avatar: "",
    },
    content: "Have you considered asking a trusted adult like a school counselor or family doctor to help you have this conversation? Sometimes parents are more receptive when another adult they respect is involved. Also, there are some great short videos explaining anxiety that might help them understand what you're experiencing.",
    likes: 8,
    createdAt: "1 day ago",
  },
  {
    id: "c3",
    postId: "1",
    author: {
      name: "BeenThereToo",
      avatar: "",
    },
    content: "My parents were the same way. I started by lending them a book about anxiety that helped me, which opened the door to conversations. Sometimes it's easier for them to learn at their own pace rather than feeling 'lectured to' in a conversation. Good luck! Remember that their resistance probably comes from concern, even if it doesn't feel helpful.",
    likes: 15,
    createdAt: "2 days ago",
  },
  {
    id: "c4",
    postId: "2",
    author: {
      name: "BoundaryQueen",
      avatar: "",
    },
    content: "It might help to have a direct but loving conversation at a neutral time (not during an argument). Try using 'I' statements like 'I feel frustrated when my decisions are questioned because it makes me feel like my independence isn't recognized.' Also remember this is an adjustment for them too - you might need to gently remind them several times.",
    likes: 22,
    createdAt: "5 days ago",
  },
  {
    id: "c5",
    postId: "2",
    author: {
      name: "FamilyTherapist",
      avatar: "",
    },
    content: "Consider that your parents might be struggling with their changing role in your life. When you've been someone's caretaker for decades, it can be hard to switch that off. Maybe create some new traditions or ways of connecting as adults - like asking their advice on something meaningful (but not critical) to show you still value their input, just in different ways now.",
    likes: 18,
    createdAt: "6 days ago",
  }
];

// Mock data for trending tags
export const mockTrendingTags = [
  { name: "communication", count: 87 },
  { name: "boundaries", count: 76 },
  { name: "mental-health", count: 64 },
  { name: "cultural-differences", count: 58 },
  { name: "generational-gap", count: 52 },
  { name: "career", count: 49 },
  { name: "relationships", count: 45 },
  { name: "independence", count: 41 },
  { name: "lgbtq", count: 37 },
  { name: "respect", count: 33 },
];

// Add more mock data as needed
