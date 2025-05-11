
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockPosts } from "@/data/mockData";
import PostCard from "@/components/PostCard";
import { Post } from "@/components/PostCard";
import { toast } from "@/components/ui/use-toast";

const CommunityPage = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Load mock data
  useEffect(() => {
    console.log("Loading community posts from mock data");
    const timer = setTimeout(() => {
      try {
        setPosts(mockPosts);
        console.log("Community posts loaded:", mockPosts);
        setLoading(false);
        toast({
          title: "Community posts loaded",
          description: `${mockPosts.length} posts have been loaded successfully.`
        });
      } catch (error) {
        console.error("Error loading posts:", error);
        toast({
          variant: "destructive",
          title: "Error loading posts",
          description: "There was a problem loading the community posts."
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle post voting
  const handlePostVote = (postId: string, voteType: 'up' | 'down') => {
    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === postId) {
          const updatedLikes = voteType === 'up' 
            ? post.likes + 1 
            : post.likes - 1;
          
          return { ...post, likes: updatedLikes };
        }
        return post;
      })
    );
    
    toast({
      title: `${voteType === 'up' ? 'Upvoted' : 'Downvoted'} post`,
      description: `You've ${voteType === 'up' ? 'upvoted' : 'downvoted'} this post.`
    });
  };

  // Filter and sort posts
  const filteredPosts = posts
    .filter(post => {
      return post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
             post.content.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "most_comments") {
        return b.comments - a.comments;
      } else if (sortBy === "most_likes") {
        return b.likes - a.likes;
      }
      return 0;
    });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Community Forum</h1>
      
      {/* Search and Filters */}
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <Input
          type="text"
          placeholder="Search posts..."
          className="border p-2 rounded flex-grow md:flex-grow-0 md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="most_comments">Most Comments</SelectItem>
            <SelectItem value="most_likes">Most Likes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Posts rendering */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-xl text-gray-500">No posts found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post}
              onVote={handlePostVote} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
