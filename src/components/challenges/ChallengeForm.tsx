
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { createChallenge, getAllTags } from "@/services/challengesService";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TagsDisplay from "./TagsDisplay";
import TagInput from "./TagInput";
import PopularTags from "./PopularTags";
import RecommendedTags from "./RecommendedTags";
import LocationInfo from "./LocationInfo";

// Suggested tags based on common terms in eldercare
const suggestedTags = [
  "medication", "memory", "mobility", "healthcare", "finances", 
  "independence", "social", "technology", "safety", "nutrition",
  "mental-health", "housing", "transportation", "legal", "communication"
];

const moods = [
  { value: "hopeful", label: "Hopeful" },
  { value: "concerned", label: "Concerned" },
  { value: "confused", label: "Confused" },
  { value: "frustrated", label: "Frustrated" },
  { value: "overwhelmed", label: "Overwhelmed" },
  { value: "grateful", label: "Grateful" },
];

type FormValues = {
  title: string;
  description: string;
  mood: string;
  age_group: string;
};

const ChallengeForm = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [recommendedTags, setRecommendedTags] = useState<string[]>([]);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState({ city: "", country: "" });
  
  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      mood: "",
      age_group: "",
    },
  });
  
  const description = form.watch("description");
  
  // Fetch user profile data including location
  useEffect(() => {
    const fetchProfileData = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("city, country")
            .eq("id", user.id)
            .single();
          
          if (error) {
            console.error("Error fetching user profile:", error);
          } else if (data) {
            setUserLocation({
              city: data.city || "",
              country: data.country || ""
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };
    
    fetchProfileData();
  }, [user]);

  // Load existing tags and popular tags from the database
  useEffect(() => {
    const loadTags = async () => {
      const dbTags = await getAllTags();
      setExistingTags(dbTags);
      
      // Set some popular tags (in a real app, we would count tag usage)
      // For now, we'll just use the first 5-8 tags as "popular"
      const popular = dbTags.slice(0, Math.min(8, dbTags.length));
      setPopularTags(popular);
    };

    loadTags();
  }, []);
  
  // Simple algorithm to recommend tags based on content
  useEffect(() => {
    if (description) {
      const lowerDesc = description.toLowerCase();
      // Combine suggested tags with existing tags from the database for recommendations
      const allPossibleTags = [...new Set([...suggestedTags, ...existingTags])];
      const recommended = allPossibleTags.filter(tag => 
        lowerDesc.includes(tag.toLowerCase()) && !tags.includes(tag)
      );
      setRecommendedTags(recommended.slice(0, 5));
    } else {
      setRecommendedTags([]);
    }
  }, [description, tags, existingTags]);
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleAddRecommendedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
      setRecommendedTags(recommendedTags.filter(t => t !== tag));
    }
  };
  
  const handleAddPopularTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };
  
  const onSubmit = async (values: FormValues) => {
    if (!user?.id) {
      toast.error("You must be logged in to create a challenge");
      return;
    }

    if (tags.length === 0) {
      toast.error("Please add at least one tag");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const result = await createChallenge({
        ...values,
        // Use the user's location from their profile
        location: userLocation.city ? 
          `${userLocation.city}${userLocation.country ? ', ' + userLocation.country : ''}` : 
          userLocation.country,
        tags
      }, user.id);
      
      if (result) {
        // Reset form
        form.reset();
        setTags([]);
        setTagInput("");
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          rules={{ required: "Title is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Challenge Title</FormLabel>
              <FormControl>
                <Input placeholder="What's the main issue you're facing?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          rules={{ required: "Description is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your challenge in detail..." 
                  className="min-h-[150px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <FormLabel>Tags</FormLabel>
          <TagsDisplay tags={tags} onRemoveTag={handleRemoveTag} />
          
          <TagInput 
            tags={tags}
            setTags={setTags}
            existingTags={existingTags}
            tagInput={tagInput}
            setTagInput={setTagInput}
          />
          
          <PopularTags 
            popularTags={popularTags}
            onAddTag={handleAddPopularTag}
          />
          
          <RecommendedTags 
            recommendedTags={recommendedTags}
            onAddTag={handleAddRecommendedTag}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="mood"
            rules={{ required: "Please select a mood" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Mood</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="How are you feeling?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {moods.map(mood => (
                      <SelectItem key={mood.value} value={mood.value}>
                        {mood.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="age_group"
            rules={{ required: "Age group is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent's Age Group</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="60-65">60-65 years</SelectItem>
                    <SelectItem value="65-70">65-70 years</SelectItem>
                    <SelectItem value="70-75">70-75 years</SelectItem>
                    <SelectItem value="75-80">75-80 years</SelectItem>
                    <SelectItem value="80+">80+ years</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <LocationInfo userLocation={userLocation} />
        
        <Button 
          type="submit" 
          size="lg" 
          className="w-full md:w-auto"
          disabled={submitting}
        >
          {submitting ? "Posting..." : "Post Challenge"}
        </Button>
      </form>
    </Form>
  );
};

export default ChallengeForm;
