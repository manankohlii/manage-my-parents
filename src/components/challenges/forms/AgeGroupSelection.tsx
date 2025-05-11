
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

// Updated age group options to match the filter options
const ageGroups = [
  { value: "13-19", label: "Teenagers (13-19)" },
  { value: "20-34", label: "Young Adults (20-34)" },
  { value: "35-49", label: "Adults (35-49)" },
  { value: "50-64", label: "Middle-aged (50-64)" },
  { value: "65-79", label: "Seniors (65-79)" },
  { value: "80+", label: "Elderly (80+)" }
];

interface AgeGroupSelectionProps {
  control: Control<any>;
}

const AgeGroupSelection = ({ control }: AgeGroupSelectionProps) => {
  return (
    <FormField
      control={control}
      name="age_group"
      rules={{ required: "Please select an age group" }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Age Group</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select age group" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {ageGroups.map(ageGroup => (
                <SelectItem key={ageGroup.value} value={ageGroup.value}>
                  {ageGroup.label}
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

export default AgeGroupSelection;
