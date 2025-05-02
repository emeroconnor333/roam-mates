
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { airports } from "@/lib/mockData";
import { Search } from "lucide-react";

interface AirportSelectorProps {
  onAirportSelected: (airportId: string) => void;
}

const AirportSelector: React.FC<AirportSelectorProps> = ({ onAirportSelected }) => {
  const [selectedAirport, setSelectedAirport] = useState<string>("");

  const handleSelectAirport = (value: string) => {
    setSelectedAirport(value);
    onAirportSelected(value);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Where are you flying from?
      </h2>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Select value={selectedAirport} onValueChange={handleSelectAirport}>
          <SelectTrigger className="w-full pl-10 bg-white border border-gray-200 shadow-sm">
            <SelectValue placeholder="Select your departure airport" />
          </SelectTrigger>
          <SelectContent>
            {airports.map((airport) => (
              <SelectItem key={airport.id} value={airport.id}>
                {airport.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedAirport && (
        <Button 
          className="w-full mt-4 bg-holiday-primary hover:bg-holiday-secondary transition-colors"
          onClick={() => onAirportSelected(selectedAirport)}
        >
          Continue
        </Button>
      )}
    </div>
  );
};

export default AirportSelector;
