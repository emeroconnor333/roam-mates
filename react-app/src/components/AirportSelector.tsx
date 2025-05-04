import React, { useEffect, useState } from "react";
import { loadAirports, Airport } from "@/lib/loadAirports";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface AirportSelectorProps {
  onAirportSelected: (airportId: string) => void;
}

const AirportSelector: React.FC<AirportSelectorProps> = ({
  onAirportSelected,
}) => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [query, setQuery] = useState("");
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [filtered, setFiltered] = useState<Airport[]>([]);

  useEffect(() => {
    loadAirports().then(setAirports);
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    if (q.length > 1) {
      setFiltered(
        airports
          .filter(
            (a) =>
              a.name.toLowerCase().includes(q) ||
              a.iata.toLowerCase().includes(q)
          )
          .slice(0, 10)
      );
    } else {
      setFiltered([]);
    }
  }, [query, airports]);

  const handleSelect = (airport: Airport) => {
    setSelectedAirport(airport);
    setQuery(`${airport.name} (${airport.iata})`);
    setFiltered([]);
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Where are you flying from?
      </h2>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedAirport(null);
          }}
          placeholder="Search airport name or IATA code"
          className="pl-10"
        />
        {filtered.length > 0 && (
          <ul className="absolute z-10 bg-white w-full mt-1 max-h-60 overflow-y-auto border rounded shadow">
            {filtered.map((airport) => (
              <li
                key={airport.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(airport)}
              >
                {airport.name} ({airport.iata})
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedAirport && (
        <Button
          className="w-full mt-4 bg-holiday-primary hover:bg-holiday-secondary transition-colors"
          onClick={() => onAirportSelected(selectedAirport.id)}
        >
          Continue
        </Button>
      )}
    </div>
  );
};

export default AirportSelector;
