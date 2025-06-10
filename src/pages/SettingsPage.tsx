import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserCog } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const { user } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();
  
  const handleSavePreferences = () => {
    // In a real app, we would save these preferences to the database
    toast.success("Preferences saved successfully");
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      // Delete from profiles
      await supabase.from("profiles").delete().eq("id", user.id);
      toast.success("Account deleted successfully");
      // Optionally sign out and redirect
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      toast.error("Failed to delete account");
      console.error("Error deleting account:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <UserCog className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Account Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Email</Label>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>

          <div className="space-y-2">
            <Label>Account Created</Label>
            <p className="text-sm text-muted-foreground">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          <div className="pt-4">
            <Button 
              variant="outline" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Account</h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
