import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from 'lucide-react';
import StandardDialog from "@/components/ui/standard-dialog";
import { FieldInputProps } from "./types";

const CoordinateInput = ({ field, value, onChange }: FieldInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  // Local state for dialog inputs
  const [tempLat, setTempLat] = useState('');
  const [tempLng, setTempLng] = useState('');

  // Ensure value is an object, default to empty lat/lng if not
  const coordinate = typeof value === 'object' && value !== null ? value : { lat: '', lng: '' };
  const lat = coordinate.lat ?? '';
  const lng = coordinate.lng ?? '';

  // Function to set dialog state when opening
  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Initialize dialog inputs with current values
      setTempLat(lat !== '' ? String(lat) : '');
      setTempLng(lng !== '' ? String(lng) : '');
    }
    setIsOpen(open);
  };

  // Function to save changes
  const handleSave = () => {
    // Parse inputs as floats
    const parsedLat = parseFloat(tempLat);
    const parsedLng = parseFloat(tempLng);

    // Basic validation: check if both are valid numbers
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      onChange(field, { lat: parsedLat, lng: parsedLng });
      setIsOpen(false);
    } else {
      // Handle invalid input - maybe show an error message?
      // For now, just don't save or close
      console.error("Invalid latitude or longitude input");
      // Alternatively, save null or the original value if inputs are cleared/invalid?
      // If inputs are empty strings, maybe save null?
      if (tempLat.trim() === '' && tempLng.trim() === '') {
        onChange(field, null);
        setIsOpen(false);
      } else {
        // TODO: Add user feedback for invalid numbers
        alert("Please enter valid numbers for Latitude and Longitude.");
      }
    }
  };

  // Create the trigger element
  const trigger = (
    <Button variant="outline" size="sm" className="text-xs h-8 w-full justify-start font-normal">
      {lat !== '' && lng !== '' ? (
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
          {`${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`}
        </span>
      ) : (
        "Set Coordinates"
      )}
    </Button>
  );

  // Create the footer buttons
  const footer = (
    <>
      <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button type="button" onClick={handleSave}>Save Changes</Button>
    </>
  );

  return (
    <StandardDialog
      trigger={trigger}
      title="Edit Coordinates"
      description="Enter the latitude and longitude values."
      icon={MapPin}
      footer={footer}
      open={isOpen}
      onOpenChange={handleOpenChange}
      maxWidth="sm"
    >
      <div className="flex flex-col space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${field.id}-lat-dialog`} className="text-xs">
            Latitude
          </Label>
          <Input
            id={`${field.id}-lat-dialog`}
            type="number"
            step="any"
            value={tempLat} onChange={(e) => setTempLat(e.target.value)}
            placeholder="e.g., 40.7128"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${field.id}-lng-dialog`} className="text-xs">
            Longitude
          </Label>
          <Input
            id={`${field.id}-lng-dialog`}
            type="number"
            step="any"
            value={tempLng} onChange={(e) => setTempLng(e.target.value)}
            placeholder="e.g., -74.0060"
          />
        </div>
      </div>
    </StandardDialog>
  );
};

export default CoordinateInput;
