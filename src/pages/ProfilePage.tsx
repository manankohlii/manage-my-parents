
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Profile {
  first_name: string;
  last_name: string;
  display_name: string;
  city: string;
  country: string;
  age_category: string;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>({
    first_name: "",
    last_name: "",
    display_name: "",
    city: "",
    country: "",
    age_category: "",
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, display_name, city, country, age_category")
        .eq("id", user?.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          display_name: profile.display_name,
          city: profile.city,
          country: profile.country,
          age_category: profile.age_category,
        })
        .eq("id", user?.id);

      if (error) {
        toast.error("Failed to update profile");
        console.error("Error updating profile:", error);
      } else {
        toast.success("Profile updated successfully");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred");
    }
  };

  const getInitials = () => {
    if (profile.display_name) {
      return profile.display_name.substring(0, 2).toUpperCase();
    } else if (profile.first_name) {
      return profile.first_name.substring(0, 1).toUpperCase() + 
        (profile.last_name ? profile.last_name.substring(0, 1).toUpperCase() : '');
    }
    return user?.email?.substring(0, 2).toUpperCase() || "??";
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src="" alt={profile.display_name || "User"} />
              <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">
              {profile.display_name || user?.email}
            </h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={profile.first_name || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={profile.last_name || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  name="display_name"
                  value={profile.display_name || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age_category">Age Category</Label>
                <Input
                  id="age_category"
                  name="age_category"
                  value={profile.age_category || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={profile.city || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={profile.country || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              {isEditing ? (
                <>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </>
              ) : (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
