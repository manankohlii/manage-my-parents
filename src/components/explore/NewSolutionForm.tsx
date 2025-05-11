
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  FormField,
  FormItem, 
  FormLabel,
  FormControl,
  FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

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
  const form = useForm();
  
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
      <PopoverContent className="w-96">
        <form 
          className="space-y-4" 
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitSolution(challengeId);
          }}
        >
          <h4 className="font-medium">Add Your Solution</h4>
          
          <FormField
            control={form.control}
            name="solution"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    value={newSolution}
                    onChange={(e) => setNewSolution(e.target.value)}
                    placeholder="Share your experience or advice..."
                    className="min-h-[150px] resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="ghost" 
              onClick={() => {
                setIsOpen(null);
                setNewSolution("");
              }}
              type="button"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={loadingSolution}
            >
              {loadingSolution ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default NewSolutionForm;
