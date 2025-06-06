import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Solution } from "@/services/solutionsService";
import { toast } from "sonner";

interface SolutionFormProps {
  challengeId: string;
  onSubmit: (solutionText: string) => Promise<void>;
  loading: boolean;
  user: any;
  solutions: Solution[];
}

const SolutionForm = ({
  challengeId,
  onSubmit,
  loading,
  user,
  solutions
}: SolutionFormProps) => {
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast.error("Solution cannot be empty");
      return;
    }
    
    try {
      await onSubmit(text.trim());
      setText("");
    } catch (error) {
      console.error("Error submitting solution:", error);
      toast.error("Failed to submit solution");
    }
  };

  if (!user) {
    return (
      <div className="px-6 py-4 text-center border-t">
        <p className="text-muted-foreground">
          Please log in to contribute solutions.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 py-4 border-t">
      <h3 className="text-sm font-medium mb-2">Contribute a solution</h3>
      <Textarea
        placeholder="Share your solution..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[100px] mb-2"
        disabled={loading}
      />
      <Button 
        type="submit" 
        disabled={!text.trim() || loading}
        className="w-full sm:w-auto"
      >
        {loading ? "Submitting..." : "Submit Solution"}
      </Button>
    </form>
  );
};

export default SolutionForm;
