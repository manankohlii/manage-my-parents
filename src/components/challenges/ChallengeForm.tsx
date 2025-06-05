import { useState, useEffect } from "react";
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

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ChallengeFormProps {
  onSubmit?: () => void;
  onClose?: () => void;
}

const ChallengeForm = ({ onSubmit, onClose }: ChallengeFormProps) => {
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

  // Load user profile data and tags
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      try {
        // Load user profile
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("city, country")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error loading profile:", error);
        } else if (profile) {
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
  }, [user?.id]);

  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const challenge = await createChallenge({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        tags: selectedTags,
        mood: "neutral",
        age_group: formData.age_group
      }, user.id);

      toast({
        title: "Challenge created!",
        description: "Your challenge has been shared with the community.",
      });

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
      console.error("Error creating challenge:", error);
      toast({
        title: "Error",
        description: "Failed to create challenge. Please try again.",
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
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Where are you located?"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
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
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm border transition-colors ${
                  selectedTags.includes(tag)
                    ? "bg-primary/10 text-primary border-primary"
                    : "bg-background hover:bg-accent border-border"
                }`}
              >
                <Tag size={14} />
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="age_group">Age Group</Label>
          <Select
            value={formData.age_group}
            onValueChange={(value) => setFormData({ ...formData, age_group: value })}
          >
            <SelectTrigger id="age_group">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="13-19">Teenager (13-19)</SelectItem>
              <SelectItem value="20-34">Young Adult (20-34)</SelectItem>
              <SelectItem value="35-59">Middle-Aged Adult (35-59)</SelectItem>
              <SelectItem value="60+">Senior (60+)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Share Challenge"}
        </Button>
      </form>
    </div>
  );
};

export default ChallengeForm;
