
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

interface TitleFieldProps {
  control: Control<any>;
}

const TitleField = ({ control }: TitleFieldProps) => {
  return (
    <FormField
      control={control}
      name="title"
      rules={{ required: "Title is required" }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Challenge Title</FormLabel>
          <FormControl>
            <Input placeholder="What's the main issue you're facing?" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TitleField;
