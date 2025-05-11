
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

interface AgeGroupSelectionProps {
  control: Control<any>;
}

const AgeGroupSelection = ({ control }: AgeGroupSelectionProps) => {
  return (
    <FormField
      control={control}
      name="age_group"
      rules={{ required: "Age group is required" }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Parent's Age Group</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select age group" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="60-65">60-65 years</SelectItem>
              <SelectItem value="65-70">65-70 years</SelectItem>
              <SelectItem value="70-75">70-75 years</SelectItem>
              <SelectItem value="75-80">75-80 years</SelectItem>
              <SelectItem value="80+">80+ years</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default AgeGroupSelection;
