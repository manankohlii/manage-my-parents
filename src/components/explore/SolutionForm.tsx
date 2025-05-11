
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Solution } from "@/services/solutionsService";
import { zodResolver } from "@hookform/resolvers/zod";

interface SolutionFormProps {
  challengeId: string;
  onSubmit: (solution: string) => Promise<void>;
  loading: boolean;
  user: any;
  solutions?: Solution[];
}

// Create a schema for solution validation
const formSchema = z.object({
  solution: z.string().min(1, "Solution is required")
});

const SolutionForm = ({
  challengeId,
  onSubmit,
  loading,
  user,
  solutions = []
}: SolutionFormProps) => {
  const [expanded, setExpanded] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      solution: ""
    }
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit(values.solution);
    form.reset();
    setExpanded(false);
  };

  if (!user) {
    return (
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Please sign in to contribute solutions
      </div>
    );
  }

  return (
    <div className="mt-6">
      {!expanded ? (
        <Button 
          onClick={() => setExpanded(true)} 
          variant="outline" 
          className="w-full"
        >
          Contribute a Solution
        </Button>
      ) : (
        <Card className="w-full border-purple-200 dark:border-purple-900">
          <CardHeader>
            <CardTitle className="text-lg">Add Your Solution</CardTitle>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <CardContent>
                <FormField
                  control={form.control}
                  name="solution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Solution</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your experience or advice..."
                          className="min-h-[150px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setExpanded(false);
                    form.reset();
                  }}
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Solution"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      )}
      
      {solutions.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium">Solutions ({solutions.length})</h3>
        </div>
      )}
    </div>
  );
};

export default SolutionForm;
