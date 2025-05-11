
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const TagBadge = ({ text, className, size = 'md', onClick }: TagBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span 
      className={cn(
        "inline-block bg-blue-100 text-blue-800 rounded-full font-medium",
        "hover:bg-blue-200 transition-colors",
        sizeClasses[size],
        onClick ? "cursor-pointer" : "",
        className
      )}
      onClick={onClick}
    >
      {text}
    </span>
  );
};

export default TagBadge;
