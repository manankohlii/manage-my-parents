
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
  ageGroup: string;
  location: string;
};

const AddChallenge = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [recommendedTags, setRecommendedTags] = useState<string[]>([]);
  
  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      mood: "",
      ageGroup: "",
      location: "",
    },
  });
  
  const description = form.watch("description");
  
  // Simple algorithm to recommend tags based on content
  // In a real app, this could be powered by NLP or AI
  useEffect(() => {
    if (description) {
      const lowerDesc = description.toLowerCase();
      const recommended = suggestedTags.filter(tag => 
        lowerDesc.includes(tag.toLowerCase()) && !tags.includes(tag)
      );
      setRecommendedTags(recommended.slice(0, 5));
    } else {
      setRecommendedTags([]);
    }
  }, [description, tags]);
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };
  
  const handleAddRecommendedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
      setRecommendedTags(recommendedTags.filter(t => t !== tag));
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const onSubmit = (values: FormValues) => {
    if (tags.length === 0) {
      toast.error("Please add at least one tag");
      return;
    }
    
    // In a real app, you would save this to the database
    const newChallenge = {
      ...values,
      tags,
      createdAt: new Date().toISOString(),
      userId: user?.id,
    };
    
    console.log("New challenge:", newChallenge);
    toast.success("Challenge posted successfully!");
    
    // Reset form
    form.reset();
    setTags([]);
    setTagInput("");
  };
  
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
              
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add relevant tags..."
                />
                <Button type="button" onClick={handleAddTag}>Add Tag</Button>
              </div>
              
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                name="ageGroup"
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
              
              <FormField
                control={form.control}
                name="location"
                rules={{ required: "Location is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" size="lg" className="w-full md:w-auto">
              Post Challenge
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddChallenge;
