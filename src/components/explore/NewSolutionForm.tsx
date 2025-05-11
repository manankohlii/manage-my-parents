
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface NewSolutionFormProps {
  challengeId: string;
  isOpen: boolean;
  setIsOpen: (isOpen: string | null) => void;
  handleSubmitSolution: (challengeId: string) => Promise<void>;
  newSolution: string;
  setNewSolution: (value: string) => void;
  loadingSolution: boolean;
  user: any;
}

const NewSolutionForm = ({
  challengeId,
  isOpen,
  setIsOpen,
  handleSubmitSolution,
  newSolution,
  setNewSolution,
  loadingSolution,
  user
}: NewSolutionFormProps) => {
  const handleOpenChange = (open: boolean) => {
    if (!user && open) {
      toast.error("You must be logged in to submit a solution");
      return;
    }
    setIsOpen(open ? challengeId : null);
  };

  return (
    <Popover 
      open={isOpen} 
      onOpenChange={handleOpenChange}
    >
      <PopoverTrigger asChild>
        <Button variant="outline">Contribute a Solution</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">Add Your Solution</h4>
          <Textarea
            value={newSolution}
            onChange={(e) => setNewSolution(e.target.value)}
            placeholder="Share your experience or advice..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end space-x-2">
            <Button 
              variant="ghost" 
              onClick={() => {
                setIsOpen(null);
                setNewSolution("");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => handleSubmitSolution(challengeId)}
              disabled={loadingSolution}
            >
              {loadingSolution ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NewSolutionForm;
