
import React, { useState } from "react";
import AirportSelector from "@/components/AirportSelector";
import TagSelector from "@/components/TagSelector";
import GameScreen from "@/components/GameScreen";
import WinnerScreen from "@/components/WinnerScreen";
import { City } from "@/lib/mockData";
import { Toaster } from "@/components/ui/sonner";
import { Heart } from "lucide-react";

type AppState = "airport" | "tags" | "game" | "winner";

const Index = () => {
  const [state, setState] = useState<AppState>("airport");
  const [selectedAirport, setSelectedAirport] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [winningCity, setWinningCity] = useState<City | null>(null);

  const handleAirportSelected = (airportId: string) => {
    setSelectedAirport(airportId);
    setState("tags");
  };

  const handleTagsSelected = (tags: string[]) => {
    setSelectedTags(tags);
    setState("game");
  };

  const handleGameComplete = (winner: City) => {
    setWinningCity(winner);
    setState("winner");
  };

  const handlePlayAgain = () => {
    setState("airport");
    setSelectedTags([]);
    setWinningCity(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-holiday-softPurple">
      <header className="py-6 px-4 text-center">
        <div className="flex items-center justify-center">
          <Heart className="text-holiday-red mr-2" size={24} fill="#ea384c" />
          <h1 className="text-3xl font-bold text-holiday-primary">RoamMates</h1>
        </div>
        <p className="text-holiday-secondary mt-1">Find your perfect holiday destination</p>
      </header>

      <main className="container px-4 py-8 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 transition-all">
          {state === "airport" && (
            <AirportSelector onAirportSelected={handleAirportSelected} />
          )}

          {state === "tags" && (
            <TagSelector onTagsSelected={handleTagsSelected} />
          )}

          {state === "game" && (
            <GameScreen 
              selectedTags={selectedTags} 
              onGameComplete={handleGameComplete}
            />
          )}

          {state === "winner" && winningCity && (
            <WinnerScreen 
              winningCity={winningCity} 
              onPlayAgain={handlePlayAgain} 
            />
          )}
        </div>
      </main>
      
      <footer className="py-4 text-center text-sm text-gray-500">
        <p>© 2025 RoamMates - Find your perfect group holiday</p>
      </footer>
      
      <Toaster />
    </div>
  );
};

export default Index;
