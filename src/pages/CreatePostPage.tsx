
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { mockTrendingTags } from "@/data/mockData";

const CreatePostPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [newTag, setNewTag] = useState("");
  const navigate = useNavigate();

  const availableTags = mockTrendingTags.map((tag) => tag.name);

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    const formattedTag = newTag.trim().toLowerCase().replace(/\s+/g, "-");
    
    if (selectedTags.includes(formattedTag)) {
      toast.error("Tag already added");
      return;
    }
    
    setSelectedTags([...selectedTags, formattedTag]);
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleSelectExistingTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (selectedTags.length === 0) {
      toast.error("Please add at least one tag");
      return;
    }
    
    // In a real app, this would send the post to a backend
    toast.success("Post created successfully!");
    navigate("/community");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link to="/community" className="inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Content <span className="text-red-500">*</span></Label>
              <Textarea
                id="content"
                placeholder="Describe your challenge or situation in detail..."
                className="min-h-[200px] resize-y"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <Label>Tags <span className="text-red-500">*</span></Label>
              <p className="text-sm text-muted-foreground">Add tags to help others find your post</p>
              
              {/* Selected Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedTags.map((tag) => (
                  <div 
                    key={tag} 
                    className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium flex items-center"
                  >
                    #{tag}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-primary hover:text-primary/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Add New Tag */}
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Add a new tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Popular Tags */}
              <div>
                <Label className="text-sm">Popular tags:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`text-sm px-3 py-1 border rounded-full ${
                        selectedTags.includes(tag)
                          ? "bg-primary text-white"
                          : "bg-background hover:bg-muted"
                      }`}
                      onClick={() => handleSelectExistingTag(tag)}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="anonymous" 
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
              />
              <Label htmlFor="anonymous">Post anonymously</Label>
              <p className="text-xs text-muted-foreground">(Your display name will not be shown)</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link to="/community">Cancel</Link>
            </Button>
            <Button type="submit">Create Post</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreatePostPage;
