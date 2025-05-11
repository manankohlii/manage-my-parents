
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect to login if user is not authenticated and not loading
    if (!loading && !user) {
      // Check if we're on the homepage - allow public access
      if (window.location.pathname === "/") {
        return; // Allow access to home page without authentication
      }
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow rendering children for the home page without requiring auth
  if (window.location.pathname === "/") {
    return <>{children}</>;
  }

  // For other protected routes, only render if authenticated
  return user ? <>{children}</> : null;
}
