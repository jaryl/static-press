import { Input } from "@/components/ui/input";
import { FieldInputProps } from "./types";

const ImageInput = ({ field, value, onChange }: FieldInputProps) => (
  <Input
    type="text"
    value={value}
    onChange={(e) => onChange(field, e.target.value)}
    placeholder="Enter image URL"
    className="h-8 text-xs py-0 w-full"
  />
  // TODO: Implement a proper file upload or image selection component later
);

export default ImageInput;
