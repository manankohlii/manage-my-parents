
import { useState } from "react";
import { createSolution, getSolutions, Solution } from "@/services/solutionsService";
import { toast } from "sonner";

export const useSolutions = (user: any, updateUserVotesForSolutions: (solutionIds: string[]) => void) => {
  const [solutions, setSolutions] = useState<Record<string, Solution[]>>({});
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [newSolution, setNewSolution] = useState("");
  const [loadingSolution, setLoadingSolution] = useState(false);

  // Load solutions for a challenge when expanded
  const loadSolutions = async (challengeId: string) => {
    try {
      // Check if we already have solutions for this challenge to avoid duplicate loads
      if (solutions[challengeId] && solutions[challengeId].length > 0) {
        return;
      }

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
      // Make sure we still set an empty array to prevent repeated loading attempts
      setSolutions(prev => ({
        ...prev,
        [challengeId]: []
      }));
      toast.error("Failed to load solutions");
    }
  };

  const handleSubmitSolution = async (challengeId: string) => {
    if (!user?.id) {
      toast.error("You must be logged in to submit a solution");
      return;
    }
    
    if (!newSolution.trim()) {
      toast.error("Solution cannot be empty");
      return;
    }

    setLoadingSolution(true);
    
    try {
      const solution = await createSolution(challengeId, newSolution, user.id);
      
      if (solution) {
        // Update the solutions list
        setSolutions(prev => {
          const currentSolutions = prev[challengeId] || [];
          const updatedSolutions = [solution, ...currentSolutions];
          
          return {
            ...prev,
            [challengeId]: updatedSolutions
          };
        });
        
        setNewSolution("");
        setOpenPopover(null);
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
    newSolution,
    setNewSolution,
    loadingSolution,
    loadSolutions,
    handleSubmitSolution
  };
};
