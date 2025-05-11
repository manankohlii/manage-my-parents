
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
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
import TagBadge from "./TagBadge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { createChallenge, getAllTags } from "@/services/challengesService";
import { supabase } from "@/integrations/supabase/client";
import { Tag } from "lucide-react";

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

const AddChallenge = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [recommendedTags, setRecommendedTags] = useState<string[]>([]);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState({ city: "", country: "" });
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  
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
  
  // Filter tags for autocomplete based on input
  useEffect(() => {
    if (tagInput) {
      const filtered = existingTags.filter(tag => 
        tag.toLowerCase().includes(tagInput.toLowerCase()) && 
        !tags.includes(tag)
      );
      setFilteredTags(filtered.slice(0, 5));
      setShowAutocomplete(filtered.length > 0);
    } else {
      setFilteredTags([]);
      setShowAutocomplete(false);
    }
  }, [tagInput, existingTags, tags]);
  
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
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
      setShowAutocomplete(false);
    }
  };
  
  const handleSelectAutocompleteTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
      setShowAutocomplete(false);
    }
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
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
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
  
  // Display a message if location info is missing
  const locationInfoMissing = !userLocation.city && !userLocation.country;
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Share Your Challenge</CardTitle>
        <CardDescription>
          Describe a challenge you're facing with caring for your parents.
          The community will share solutions and advice.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <TagBadge 
                    key={tag} 
                    text={tag} 
                    onClick={() => handleRemoveTag(tag)}
                    className="cursor-pointer hover:bg-red-100"
                  />
                ))}
              </div>
              
              <div className="flex gap-2 relative">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add relevant tags..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  onFocus={() => tagInput && setShowAutocomplete(filteredTags.length > 0)}
                  onBlur={() => setTimeout(() => setShowAutocomplete(false), 100)}
                />
                <Button type="button" onClick={handleAddTag}>Add Tag</Button>
                
                {/* Tag Autocomplete dropdown */}
                {showAutocomplete && filteredTags.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-[calc(100%-5rem)] bg-white dark:bg-gray-800 border rounded-md shadow-lg z-10">
                    {filteredTags.map((tag) => (
                      <div 
                        key={tag}
                        className="px-3 py-2 hover:bg-muted cursor-pointer flex items-center gap-2"
                        onClick={() => handleSelectAutocompleteTag(tag)}
                      >
                        <Tag size={14} />
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Popular Tags Section */}
              {popularTags.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2 flex items-center">
                    <Tag size={14} className="mr-1" />
                    Popular tags:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map(tag => (
                      <TagBadge 
                        key={tag} 
                        text={tag}
                        onClick={() => handleAddPopularTag(tag)}
                        className="cursor-pointer bg-muted hover:bg-primary hover:text-white"
                        size="sm"
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {recommendedTags.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-1">Recommended tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {recommendedTags.map(tag => (
                      <TagBadge 
                        key={tag} 
                        text={tag}
                        onClick={() => handleAddRecommendedTag(tag)}
                        className="cursor-pointer bg-muted hover:bg-primary hover:text-white"
                      />
                    ))}
                  </div>
                </div>
              )}
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
            
            {/* Display user location information */}
            <div className="bg-muted/30 p-3 rounded-md">
              <p className="text-sm font-medium mb-1">Your Location</p>
              {locationInfoMissing ? (
                <p className="text-sm text-muted-foreground">
                  No location information in your profile. 
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-sm" 
                    onClick={() => navigate('/profile')}
                  >
                    Update your profile
                  </Button>
                </p>
              ) : (
                <p className="text-sm">
                  {userLocation.city && userLocation.country 
                    ? `${userLocation.city}, ${userLocation.country}` 
                    : userLocation.city || userLocation.country}
                </p>
              )}
            </div>
            
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
      </CardContent>
    </Card>
  );
};

export default AddChallenge;
