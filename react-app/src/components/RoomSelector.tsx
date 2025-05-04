// src/components/RoomSelector.tsx

import React, { useState } from "react";
// Assuming these UI components are from shadcn/ui or similar
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Icons
import { DoorOpen, Plus, RefreshCw } from "lucide-react";

// Define the expected properties for the component
interface RoomSelectorProps {
  // Callback function passed from the parent component (GroupjcPage)
  // It gets called with the room code and a flag indicating if it's a new room.
  onRoomSelected: (roomCode: string, isNewRoom: boolean) => void;
}

// Define the RoomSelector functional component
const RoomSelector: React.FC<RoomSelectorProps> = ({ onRoomSelected }) => {
  // State variable to hold the room code entered by the user for joining
  const [joinRoomCode, setJoinRoomCode] = useState<string>("");
  // State variable to hold the room code for creating (initialized with a random code)
  const [newRoomCode, setNewRoomCode] = useState<string>(generateRandomCode());
  // State variable to track the currently active tab ('join' or 'create')
  const [activeTab, setActiveTab] = useState<string>("join");

  // Helper function to generate a random 6-character alphanumeric code
  function generateRandomCode(): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  // Handler function for the "Join Room" button click
  const handleJoinRoom = () => {
    const trimmedCode = joinRoomCode.trim();
    // Check if the input code is not empty after trimming whitespace
    if (trimmedCode) {
      // Call the parent component's callback function
      // Pass the uppercase code and 'false' for isNewRoom
      onRoomSelected(trimmedCode.toUpperCase(), false);
    }
  };

  // Handler function for the "Create Room" button click
  const handleCreateRoom = () => {
    const trimmedCode = newRoomCode.trim();
    // Check if the generated/edited code is not empty after trimming
    if (trimmedCode) {
      // Call the parent component's callback function
      // Pass the uppercase code and 'true' for isNewRoom
      onRoomSelected(trimmedCode.toUpperCase(), true);
    }
  };

  // Handler function for the "Regenerate Code" button click
  const regenerateCode = () => {
    // Generate a new random code and update the state
    setNewRoomCode(generateRandomCode());
  };

  // --- JSX structure for the component ---
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Title */}
      <h2 className="text-2xl font-bold mb-6 text-center text-holiday-primary">
        Travel Room
      </h2>
      
      {/* Tabs component to switch between Join and Create */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tab triggers (buttons) */}
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="join">Join Room</TabsTrigger>
          <TabsTrigger value="create">Create Room</TabsTrigger>
        </TabsList>
        
        {/* Content for the "Join Room" tab */}
        <TabsContent value="join" className="space-y-4">
          <div className="relative">
            <DoorOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            {/* Input field for entering the room code to join */}
            <Input
              placeholder="Enter room code"
              className="pl-10 bg-white border border-gray-200 shadow-sm"
              value={joinRoomCode}
              onChange={(e) => setJoinRoomCode(e.target.value)}
              maxLength={6} // Limit input length
              aria-label="Enter room code to join"
            />
          </div>
          
          {/* Helper text */}
          <p className="text-sm text-holiday-secondary text-center">
            Enter the 6-character room code provided by your friend
          </p>
          
          {/* "Join Room" button - only shown if there's text in the input */}
          {joinRoomCode.trim() && (
            <Button
              className="w-full mt-4 bg-holiday-primary hover:bg-holiday-secondary text-white transition-colors"
              onClick={handleJoinRoom}
            >
              Join Room
            </Button>
          )}
        </TabsContent>
        
        {/* Content for the "Create Room" tab */}
        <TabsContent value="create" className="space-y-4">
          <div className="relative flex items-center"> {/* Use flex to align input and button */}
            <Plus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            {/* Input field showing the generated/editable room code */}
            <Input
              placeholder="Room code"
              className="pl-10 bg-white border border-gray-200 shadow-sm flex-grow" // Allow input to grow
              value={newRoomCode}
              onChange={(e) => setNewRoomCode(e.target.value)}
              maxLength={6} // Limit input length
              aria-label="Generated room code for creating a room"
            />
            {/* Button to regenerate the room code */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-2 flex-shrink-0" // Prevent button from shrinking
              onClick={regenerateCode}
              title="Generate new code" // Tooltip text
              aria-label="Generate new room code"
            >
              <RefreshCw size={20} className="text-holiday-primary" />
            </Button>
          </div>
          
          {/* Helper text */}
          <p className="text-sm text-holiday-secondary text-center">
            Create a room with this code or generate a new one
          </p>
          
          {/* "Create Room" button - only shown if there's text in the input */}
          {newRoomCode.trim() && (
            <Button
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white transition-colors"
              onClick={handleCreateRoom}
            >
              Create Room
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Export the component for use in other files
export default RoomSelector;
