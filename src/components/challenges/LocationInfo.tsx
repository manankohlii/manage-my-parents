
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface LocationInfoProps {
  userLocation: {
    city: string;
    country: string;
  };
}

const LocationInfo = ({ userLocation }: LocationInfoProps) => {
  const navigate = useNavigate();
  const locationInfoMissing = !userLocation.city && !userLocation.country;
  
  return (
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
  );
};

export default LocationInfo;
