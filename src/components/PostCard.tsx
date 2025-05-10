
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Heart } from "lucide-react";
import TagBadge from "./TagBadge";
import { Link } from "react-router-dom";

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  tags: string[];
  likes: number;
  comments: number;
  createdAt: string;
}

const PostCard = ({
  id,
  title,
  content,
  author,
  tags,
  likes,
  comments,
  createdAt,
}: PostCardProps) => {
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
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <Link to={`/post/${id}`} className="hover:underline">
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
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Heart className="h-4 w-4 mr-1" />
          <span>{likes}</span>
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <MessageSquare className="h-4 w-4 mr-1" />
          <span>{comments}</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
