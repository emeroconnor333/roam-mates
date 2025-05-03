
import React, { useState } from "react";
import UserInput from "@/components/UserInput";
import AirportSelector from "@/components/AirportSelector";
import TagSelector from "@/components/TagSelector";
import GameScreen from "@/components/GameScreen";
import WinnerScreen from "@/components/WinnerScreen";
import { City } from "@/lib/mockData";
import { Toaster } from "@/components/ui/sonner";
import { Heart } from "lucide-react";

type AppState = "airport" | "tags" | "game" | "winner";

const Index = () => {
  const [userId, setUserId] = useState<string>("");
  const [state, setState] = useState<AppState>("airport");
  const [selectedAirport, setSelectedAirport] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [winningCity, setWinningCity] = useState<City | null>(null);
  const SUPABASE_URL = "https://fyzofzxszjsxrtaupobr.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5em9menhzempzeHJ0YXVwb2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNzM1ODgsImV4cCI6MjA2MTg0OTU4OH0.BScS2QMKlkgCMlvO33CBDBlKTPXfL96z-xswWU-oYeE";

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
        <p className="text-holiday-secondary mt-1">Find your perfect group holiday destination</p>
      </header>

      <main className="container px-4 py-8 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 transition-all">
          {state === "airport" && (
            <AirportSelector onAirportSelected={handleAirportSelected} />
          )}

          {state === "tags" && (
            <>
              <UserInput onChange={setUserId} />
              <TagSelector userId={userId} onTagsSelected={handleTagsSelected} />
            </>
          )}

          {state === "game" && (
            <GameScreen 
              selectedTags={selectedTags} 
              userId={userId}
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
