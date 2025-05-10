
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  MessageSquare, 
  Users, 
  Search,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/PostCard";
import TagBadge from "@/components/TagBadge";
import { Link } from "react-router-dom";
import { mockPosts, mockTrendingTags } from "@/data/mockData";

const DashboardPage = () => {
  const [posts, setPosts] = useState(mockPosts);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link to="/post/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
            <p className="text-xs text-muted-foreground">+20% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tags</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Trending Tags */}
      <div className="mb-10">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Search posts, topics or tags..." 
            className="w-full pl-12 pr-4 py-3 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-3">Trending Tags</h2>
          <div className="flex flex-wrap gap-2">
            {mockTrendingTags.map((tag) => (
              <TagBadge key={tag.name} text={tag.name} onClick={() => console.log(`Tag clicked: ${tag.name}`)} />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
        <div className="space-y-6">
          {posts.slice(0, 5).map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              title={post.title}
              content={post.content}
              author={post.author}
              tags={post.tags}
              likes={post.likes}
              comments={post.comments}
              createdAt={post.createdAt}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
