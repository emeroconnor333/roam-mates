

import UserInput from "@/components/UserInput";
import React, { useState, useEffect } from "react"; // Ensure useEffect is imported
// Removed RoomSelector import, as it shouldn't be here
import AirportSelector from "@/components/AirportSelector";
import TagSelector from "@/components/TagSelector";
import GameScreen from "@/components/GameScreen";
import WinnerScreen from "@/components/WinnerScreen";
import { City } from "@/lib/mockData";
import { Toaster } from "@/components/ui/sonner";
import { Heart } from "lucide-react";
// Import BOTH hooks from react-router-dom
import { useSearchParams, useNavigate } from "react-router-dom"; 

// DELETE THE OLD useRouter CODE BLOCK THAT WAS HERE

type AppState = "airport" | "tags" | "game" | "winner"; // Removed "room" state

const Index = () => {
  const [userId, setUserId] = useState<string>("");
  const [state, setState] = useState<AppState>("airport");
  // --- Correct Hook Usage ---
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get('room');
  // --- End Hook Usage ---

  // --- State ---
  // Start state at 'airport'
  
  const [selectedAirport, setSelectedAirport] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [winningCity, setWinningCity] = useState<City | null>(null);

  // --- End State ---

  // --- Effect for checking room code ---
  useEffect(() => {
    if (!roomCode) {
      console.warn("No room code found in URL. Redirecting to home page.");
      navigate('/'); // Redirect to home page ('/') if no room code
    } else {
      console.log("Index component loaded for room:", roomCode);
      // Potentially use roomCode here to fetch room-specific data if needed
    }
    // Add navigate to dependencies as it's used in the effect
  }, [roomCode, navigate]); 
  // --- End Effect ---

  // --- Handlers ---
  // Removed handleRoomSelected as this component shouldn't handle that
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
    // Reset state for a new game within the same room
    setState("airport"); 
    setSelectedAirport(""); // Reset airport maybe? Or keep it? Decide based on UX
    setSelectedTags([]);
    setWinningCity(null);
  };
  // --- End Handlers ---

  // --- Render Logic ---
  // Don't render anything until we confirm roomCode exists (or handle loading state)
  if (!roomCode) {
    // Optionally return a loading indicator or null while redirecting
    return <div>Loading or redirecting...</div>; 
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-holiday-softPurple">
      <header className="py-6 px-4 text-center">
        <div className="flex items-center justify-center">
          <Heart className="text-holiday-red mr-2" size={24} fill="#ea384c" />
          <h1 className="text-3xl font-bold text-holiday-primary">RoamMates</h1>
        </div>
        <p className="text-holiday-secondary mt-1">Find your perfect group holiday destination</p>
        {/* Display room code in header maybe? */}
        <p className="text-holiday-secondary mt-1">Room: {roomCode} - Find your perfect holiday destination</p>
      </header>

      <main className="container px-4 py-8 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 transition-all">
          {/* REMOVED: {state === "room" && <RoomSelector onRoomSelected={handleRoomSelected} />} */}
      
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
              // You might need to pass roomCode down if GameScreen needs it
              // roomCode={roomCode} 
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
        <p>© {new Date().getFullYear()} RoamMates - Find your perfect group holiday</p>
      </footer>
      
      <Toaster />
    </div>
  );
};

export default Index;