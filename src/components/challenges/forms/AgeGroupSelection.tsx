
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

// Age group options
const ageGroups = [
  { value: "adult", label: "Adult (18-64)" },
  { value: "senior", label: "Senior (65+)" },
  { value: "both", label: "All Ages" },
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
