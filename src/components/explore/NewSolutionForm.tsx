
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Form,
  FormField,
  FormItem, 
  FormLabel,
  FormControl,
  FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import * as z from "zod";

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

// Create a schema for solution validation
const FormSchema = z.object({
  solution: z.string().min(1, "Solution is required")
});

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
  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      solution: newSolution
    }
  });
  
  const handleOpenChange = (open: boolean) => {
    if (!user && open) {
      toast.error("You must be logged in to submit a solution");
      return;
    }
    setIsOpen(open ? challengeId : null);
  };

  // Handle form submission
  const onSubmit = () => {
    handleSubmitSolution(challengeId);
  };

  return (
    <Popover 
      open={isOpen} 
      onOpenChange={handleOpenChange}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" className="bg-background hover:bg-accent hover:text-accent-foreground">Contribute a Solution</Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-6">
        <Form {...form}>
          <form 
            className="space-y-6" 
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <h4 className="text-lg font-medium">Add Your Solution</h4>
            
            <FormField
              control={form.control}
              name="solution"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="font-medium">Your Solution</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your experience or advice..." 
                      className="min-h-[150px] bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none" 
                      value={newSolution}
                      onChange={(e) => {
                        setNewSolution(e.target.value);
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsOpen(null);
                  setNewSolution("");
                  form.reset();
                }}
                type="button"
                className="px-4"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={loadingSolution}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4"
              >
                {loadingSolution ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
};

export default NewSolutionForm;
