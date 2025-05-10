
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageSquare, Share, Flag, ArrowLeft } from "lucide-react";
import TagBadge from "@/components/TagBadge";
import { mockPosts, mockComments } from "@/data/mockData";
import { toast } from "sonner";

const PostDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(mockComments);

  // Find the post from our mock data
  const post = mockPosts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <p className="mb-6">The post you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/community">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Community
          </Link>
        </Button>
      </div>
    );
  }

  const handleAddComment = () => {
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    const newComment = {
      id: `comment-${Date.now()}`,
      postId: id!,
      author: {
        name: "You",
        avatar: "",
      },
      content: commentText,
      likes: 0,
      createdAt: "Just now",
    };

    setComments([newComment, ...comments]);
    setCommentText("");
    toast.success("Comment added successfully");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link to="/community" className="inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Community
          </Link>
        </Button>
      </div>

      {/* Post Detail Card */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Avatar className="h-10 w-10">
                <div className="bg-primary text-primary-foreground rounded-full h-full w-full flex items-center justify-center text-sm font-medium uppercase">
                  {post.author.name.charAt(0)}
                </div>
              </Avatar>
              <div>
                <p className="font-medium">{post.author.name}</p>
                <p className="text-xs text-muted-foreground">{post.createdAt}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
          <p className="mb-6 whitespace-pre-line">{post.content}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <TagBadge key={tag} text={tag} />
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t border-border flex justify-between">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Heart className="h-4 w-4 mr-1" />
            <span>{post.likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>{comments.length}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Share className="h-4 w-4 mr-1" />
            <span>Share</span>
          </Button>
        </CardFooter>
      </Card>

      {/* Add Comment Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Your Response</h2>
        <div className="flex space-x-4">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <div className="bg-primary text-primary-foreground rounded-full h-full w-full flex items-center justify-center text-sm font-medium uppercase">
              Y
            </div>
          </Avatar>
          <div className="flex-grow">
            <Textarea 
              placeholder="Share your thoughts, advice or experience..." 
              className="mb-3 resize-none"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end">
              <Button onClick={handleAddComment}>Post Comment</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Comments ({comments.length})</h2>
        <div className="space-y-6">
          {comments.filter(c => c.postId === id).map((comment) => (
            <div key={comment.id} className="flex space-x-4">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <div className="bg-muted text-muted-foreground rounded-full h-full w-full flex items-center justify-center text-xs font-medium uppercase">
                  {comment.author.name.charAt(0)}
                </div>
              </Avatar>
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-medium">{comment.author.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{comment.createdAt}</span>
                  </div>
                </div>
                <p className="text-sm">{comment.content}</p>
                <div className="flex space-x-4 mt-2">
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground">
                    <Heart className="h-3 w-3 mr-1" />
                    <span>{comment.likes}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground">
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
