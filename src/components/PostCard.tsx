
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import TagBadge from "./TagBadge";
import { Link } from "react-router-dom";
import { useState } from "react";

interface Author {
  name: string;
  avatar?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: Author;
  tags: string[];
  likes: number;
  comments: number;
  createdAt: string;
  isSolved?: boolean;
}

interface PostCardProps {
  post: Post;
  onVote?: (postId: string, voteType: 'up' | 'down') => void;
}

const PostCard = ({ post, onVote }: PostCardProps) => {
  const { id, title, content, author, tags, likes, comments, createdAt, isSolved } = post;
  const [currentLikes, setCurrentLikes] = useState(likes);
  
  const handleVote = (voteType: 'up' | 'down') => {
    // Update local state immediately for a responsive UI feel
    setCurrentLikes(prevLikes => voteType === 'up' ? prevLikes + 1 : prevLikes - 1);
    
    // Call the parent component's vote handler if provided
    if (onVote) {
      onVote(id, voteType);
    }
  };
  
  return (
    <Card className="mb-4 overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <div className="bg-primary text-primary-foreground rounded-full h-full w-full flex items-center justify-center text-sm font-medium uppercase">
                {author.name.charAt(0)}
              </div>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{author.name}</p>
              <p className="text-xs text-muted-foreground">{createdAt}</p>
            </div>
          </div>
          {isSolved && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Solved
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <Link to={`/post/${id}`} className="hover:underline block">
          <h3 className="font-bold text-lg mb-2">{title}</h3>
        </Link>
        <p className="text-muted-foreground mb-3 line-clamp-3">{content}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagBadge key={tag} text={tag} size="sm" />
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0 border-t border-border flex justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground"
            onClick={() => handleVote('up')}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
          </Button>
          <span>{currentLikes}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground"
            onClick={() => handleVote('down')}
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
        </div>
        <Link to={`/post/${id}`} className="inline-block">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>{comments}</span>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
