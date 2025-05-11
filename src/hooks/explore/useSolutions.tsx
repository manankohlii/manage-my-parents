
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
    if (solutions[challengeId]) return;
    
    try {
      const fetchedSolutions = await getSolutions(challengeId);
      setSolutions(prev => ({
        ...prev,
        [challengeId]: fetchedSolutions
      }));
      
      // Update user votes for these solutions
      const solutionIds = fetchedSolutions.map(solution => solution.id);
      updateUserVotesForSolutions(solutionIds);
    } catch (error) {
      console.error("Error loading solutions:", error);
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
          const updatedSolutions = prev[challengeId] ? [solution, ...prev[challengeId]] : [solution];
          return {
            ...prev,
            [challengeId]: updatedSolutions
          };
        });
        
        setNewSolution("");
        setOpenPopover(null);
      }
    } finally {
      setLoadingSolution(false);
    }
  };

  return {
    solutions,
    openPopover,
    setOpenPopover,
    newSolution,
    setNewSolution,
    loadingSolution,
    loadSolutions,
    handleSubmitSolution
  };
};
