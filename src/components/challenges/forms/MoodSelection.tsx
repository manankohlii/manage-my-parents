
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Control } from "react-hook-form";

// Mood options for the form
const moods = [
  { value: "hopeful", label: "Hopeful" },
  { value: "concerned", label: "Concerned" },
  { value: "confused", label: "Confused" },
  { value: "frustrated", label: "Frustrated" },
  { value: "overwhelmed", label: "Overwhelmed" },
  { value: "grateful", label: "Grateful" },
];

interface MoodSelectionProps {
  control: Control<any>;
}

const MoodSelection = ({ control }: MoodSelectionProps) => {
  return (
    <FormField
      control={control}
      name="mood"
      rules={{ required: "Please select a mood" }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Your Mood</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="How are you feeling?" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {moods.map(mood => (
                <SelectItem key={mood.value} value={mood.value}>
                  {mood.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default MoodSelection;
