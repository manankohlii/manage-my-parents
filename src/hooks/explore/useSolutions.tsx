import { useState } from "react";
import { createSolution, getSolutions, Solution } from "@/services/solutionsService";
import { toast } from "sonner";

export const useSolutions = (user: any, updateUserVotesForSolutions: (solutionIds: string[]) => void) => {
  const [solutions, setSolutions] = useState<Record<string, Solution[]>>({});
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [loadingSolution, setLoadingSolution] = useState(false);

  // Load solutions for a challenge when expanded
  const loadSolutions = async (challengeId: string) => {
    try {
      const fetchedSolutions = await getSolutions(challengeId);
      
      setSolutions(prev => ({
        ...prev,
        [challengeId]: fetchedSolutions
      }));
      
      // Update user votes for these solutions
      if (fetchedSolutions && fetchedSolutions.length > 0) {
        const solutionIds = fetchedSolutions.map(solution => solution.id);
        updateUserVotesForSolutions(solutionIds);
      }
    } catch (error) {
      console.error("Error loading solutions:", error);
      setSolutions(prev => ({
        ...prev,
        [challengeId]: []
      }));
      toast.error("Failed to load solutions");
    }
  };

  const handleSubmitSolution = async (challengeId: string, solutionText: string) => {
    if (!user?.id) {
      toast.error("You must be logged in to submit a solution");
      return;
    }
    
    if (!solutionText.trim()) {
      toast.error("Solution cannot be empty");
      return;
    }

    setLoadingSolution(true);
    
    try {
      const solution = await createSolution(challengeId, solutionText.trim(), user.id);
      
      if (solution) {
        // Update the solutions list
        setSolutions(prev => {
          const currentSolutions = prev[challengeId] || [];
          return {
            ...prev,
            [challengeId]: [solution, ...currentSolutions]
          };
        });
        
        // Close popover
        setOpenPopover(null);
        
        // Reload solutions to ensure we have the latest data
        await loadSolutions(challengeId);
        
        toast.success("Solution submitted successfully!");
      }
    } catch (error) {
      console.error("Error submitting solution:", error);
      toast.error("Failed to submit solution");
    } finally {
      setLoadingSolution(false);
    }
  };

  return {
    solutions,
    setSolutions,
    openPopover,
    setOpenPopover,
    loadingSolution,
    loadSolutions,
    handleSubmitSolution
  };
};
