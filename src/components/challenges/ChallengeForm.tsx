
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { createChallenge, getAllTags } from "@/services/challenges";
import { supabase } from "@/integrations/supabase/client";
import { Form } from "@/components/ui/form";
import TitleField from "./forms/TitleField";
import DescriptionField from "./forms/DescriptionField";
import MoodSelection from "./forms/MoodSelection";
import AgeGroupSelection from "./forms/AgeGroupSelection";
import TagsSection from "./forms/TagsSection";
import FormButtons from "./forms/FormButtons";
import LocationInfo from "./LocationInfo";

type FormValues = {
  title: string;
  description: string;
  mood: string;
  age_group: string;
};

const ChallengeForm = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
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
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TitleField control={form.control} />
        
        <DescriptionField control={form.control} />
        
        <TagsSection 
          tags={tags}
          setTags={setTags}
          description={description}
          existingTags={existingTags}
          popularTags={popularTags}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MoodSelection control={form.control} />
          <AgeGroupSelection control={form.control} />
        </div>
        
        <LocationInfo userLocation={userLocation} />
        
        <FormButtons submitting={submitting} />
      </form>
    </Form>
  );
};

export default ChallengeForm;
