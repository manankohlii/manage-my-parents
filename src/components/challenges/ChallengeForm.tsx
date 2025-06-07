import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { createChallenge } from "@/services/challenges";
import { getAllTags } from "@/services/challenges/tagService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Tag, X } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { Challenge } from "@/services/challenges";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ChallengeFormProps {
  onSubmit?: () => void;
  onClose?: () => void;
  challenge?: Challenge | null;
  onUpdate?: (id: string, data: any) => Promise<void>;
  onSubmitChallenge?: (data: { title: string; description: string; tags: string[] }) => Promise<void>;
}

const ChallengeForm = ({ onSubmit, onClose, challenge, onUpdate, onSubmitChallenge }: ChallengeFormProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [formData, setFormData] = useState({
      title: "",
      description: "",
    location: "",
    age_group: "20-34"
  });
  const [tagInput, setTagInput] = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  
  // Load challenge data if editing
  useEffect(() => {
    if (challenge) {
      console.log('Loading challenge data:', challenge); // Debug log
      setFormData({
        title: challenge.title || "",
        description: challenge.description || "",
        location: challenge.location || "",
        age_group: challenge.age_group || "20-34"
      });
      setSelectedTags(challenge.tags || []);
    } else {
      // Reset form when not editing
      setFormData({
        title: "",
        description: "",
        location: "",
        age_group: "20-34"
      });
      setSelectedTags([]);
    }
  }, [challenge]);

  // Prevent form from being cleared by profile data load
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id || challenge) return; // Skip if editing or no user

      try {
        // Load user profile
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("city, country")
          .eq("id", user.id)
          .single();
        
        if (error) {
          console.error("Error loading profile:", error);
        } else if (profile && !challenge) { // Only set location if not editing
          setFormData(prev => ({
            ...prev,
            location: profile.city && profile.country 
              ? `${profile.city}, ${profile.country}`
              : profile.city || profile.country || ""
          }));
        }

        // Load all tags
        const tags = await getAllTags();
        setAllTags(tags);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [user?.id, challenge]);

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }
    setTagInput("");
    setShowTagDropdown(false);
    if (tagInputRef.current) tagInputRef.current.focus();
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (tagInput.trim()) {
        handleAddTag(tagInput);
      }
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      setShowTagDropdown(true);
    }
  };

  const filteredTagSuggestions = allTags.filter(
    tag =>
      tag.toLowerCase().includes(tagInput.toLowerCase()) &&
      !selectedTags.includes(tag)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      if (onSubmitChallenge) {
        await onSubmitChallenge({
          title: formData.title,
          description: formData.description,
          tags: selectedTags,
        });
      } else if (challenge && onUpdate) {
        await onUpdate(challenge.id, {
          title: formData.title,
          description: formData.description,
          location: formData.location,
          tags: selectedTags,
          mood: challenge.mood || "neutral",
          age_group: formData.age_group
        });
      } else {
        await createChallenge({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          tags: selectedTags,
          mood: "neutral",
          age_group: formData.age_group
        }, user.id);
      }

      toast({
        title: challenge ? "Challenge updated!" : "Challenge created!",
        description: challenge 
          ? "Your challenge has been updated successfully."
          : "Your challenge has been shared with the community.",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        location: "",
        age_group: "20-34"
      });
      setSelectedTags([]);

      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      console.error("Error saving challenge:", error);
      toast({
        title: "Error",
        description: `Failed to ${challenge ? 'update' : 'create'} challenge. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="relative">
      <Button
        type="button"
        onClick={onClose}
        variant="ghost"
        size="sm"
        className="absolute -right-2 -top-2 text-destructive hover:text-destructive/80 hover:bg-transparent"
        aria-label="Close dialog"
      >
        Cancel
      </Button>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="What's your challenge?"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your challenge in detail..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedTags.map(tag => (
              <div
                key={tag}
                className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
              >
                <Tag size={14} />
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-primary hover:text-primary/80"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="relative w-48">
            <Input
              ref={tagInputRef}
              type="text"
              placeholder="Add or search for a tag"
              value={tagInput}
              onChange={e => {
                setTagInput(e.target.value);
                setShowTagDropdown(true);
              }}
              onFocus={() => setShowTagDropdown(true)}
              onBlur={() => setTimeout(() => setShowTagDropdown(false), 100)}
              onKeyDown={handleTagInputKeyDown}
            />
            {showTagDropdown && filteredTagSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-lg max-h-40 overflow-auto">
                {filteredTagSuggestions.map(tag => (
                  <div
                    key={tag}
                    className="px-3 py-2 cursor-pointer hover:bg-primary/10"
                    onMouseDown={() => handleAddTag(tag)}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <Button type="submit" disabled={loading}>
          {loading ? (challenge ? "Updating..." : "Creating...") : (challenge ? "Update Challenge" : "Share Challenge")}
        </Button>
      </form>
    </div>
  );
};

export default ChallengeForm;
