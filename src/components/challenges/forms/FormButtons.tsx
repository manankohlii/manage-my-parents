
import { Button } from "@/components/ui/button";

interface FormButtonsProps {
  submitting: boolean;
}

const FormButtons = ({ submitting }: FormButtonsProps) => {
  return (
    <Button 
      type="submit" 
      size="lg" 
      className="w-full md:w-auto"
      disabled={submitting}
    >
      {submitting ? "Posting..." : "Post Challenge"}
    </Button>
  );
};

export default FormButtons;
