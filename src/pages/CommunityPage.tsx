
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import PostCard from "@/components/PostCard";
import TagBadge from "@/components/TagBadge";
import { Link } from "react-router-dom";
import { mockPosts, mockTrendingTags } from "@/data/mockData";

const CommunityPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const filteredPosts = mockPosts.filter((post) => {
    // If no tags selected, show all posts
    if (selectedTags.length === 0) return true;
    
    // Show posts that have at least one of the selected tags
    return post.tags.some((tag) => selectedTags.includes(tag));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Community</h1>
        <Button asChild>
          <Link to="/post/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-8">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search community posts..."
            className="w-full pl-12 py-6 text-base rounded-full"
          />
        </div>

        <div>
          <h2 className="text-lg font-medium mb-3">Filter by Tags</h2>
          <div className="flex flex-wrap gap-2">
            {mockTrendingTags.map((tag) => (
              <TagBadge
                key={tag.name}
                text={tag.name}
                className={selectedTags.includes(tag.name) ? "bg-primary text-white" : ""}
                onClick={() => toggleTag(tag.name)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Posts Tabs */}
      <Tabs defaultValue="latest" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="latest">Latest</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="solved">Solved</TabsTrigger>
        </TabsList>
        <TabsContent value="latest" className="space-y-6">
          {filteredPosts.map((post) => (
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
        </TabsContent>
        <TabsContent value="trending" className="space-y-6">
          {filteredPosts
            .sort((a, b) => b.likes - a.likes)
            .map((post) => (
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
        </TabsContent>
        <TabsContent value="solved" className="space-y-6">
          {filteredPosts
            .filter((post) => post.isSolved)
            .map((post) => (
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityPage;
