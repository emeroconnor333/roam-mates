// src/pages/groupjc.tsx

import React from "react";
import RoomSelector from "@/components/RoomSelector";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react"; 
// Import the Supabase client
import { supabase } from "@/lib/supabaseClient"; 
// Import toast for user feedback
import { toast } from "sonner"; 

// Component definition (make sure name matches App.tsx usage)
const GroupjcPage = () => { 
  const navigate = useNavigate();

  // *** Make the handler async to use await ***
  const handleRoomSelected = async (roomCode: string, isNewRoom: boolean) => {
    // Log 1: Initial call
    console.log(
      `handleRoomSelected called. Code: ${roomCode}, Is new: ${isNewRoom}.`
    );

    // *** Check if it's a new room before trying to insert ***
    if (isNewRoom) {
      // Log 2: Entered the 'isNewRoom' block
      console.log("Entered 'isNewRoom' block."); 
      
      // Log 3: About to enter the try block
      console.log("Attempting Supabase operation (before try block)..."); 
      
      // *** Use try...catch for database operations ***
      try {
        // Log 4: Inside the try block, before await
        console.log(`Inside try block, about to await Supabase insert for ${roomCode}...`); 
        
        // *** Perform the database insert and wait for it ***
        const { data, error } = await supabase
          .from('rooms') // Your table name
          .insert([
            { room_code: roomCode } // Your column name : value
          ])
          .select(); // Optional: select the inserted data back

        // Log 5: After await
        console.log("Supabase insert awaited. Checking for error..."); 

        // *** Check if Supabase returned an error ***
        if (error) {
          console.error("Supabase insert error:", error.message);
          toast.error(`Failed to create room: ${error.message}`); 
          // *** Stop if there was an error ***
          return; 
        }

        // Log 6: Success
        console.log("Supabase insert successful. Data:", data);
        toast.success(`Room ${roomCode} created successfully!`);
        
        // Log 7: Navigating after success
        // *** Navigate ONLY after successful insert ***
        console.log("Navigating to /app after successful insert...");
        navigate(`/app?room=${roomCode}`);

      } catch (err) {
          // Log 8: Catch block for unexpected errors
          console.error("Caught unexpected error during Supabase operation:", err); 
          toast.error("An unexpected error occurred while creating the room.");
          // *** Stop if there was an unexpected error ***
          return;
      }
    } else {
      // Log 9: Else block (joining room)
      // *** If joining, navigate immediately ***
      console.log(`Joining existing room ${roomCode}. Navigating...`); 
      navigate(`/app?room=${roomCode}`);
    }
  };

  // --- JSX structure for the component ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-holiday-softPurple flex flex-col">
      {/* Header section */}
      <header className="py-6 px-4 text-center">
        <div className="flex items-center justify-center">
          <Heart className="text-holiday-red mr-2" size={24} fill="#ea384c" />
          <h1 className="text-3xl font-bold text-holiday-primary">RoamMates</h1>
        </div>
        <p className="text-holiday-secondary mt-1">
          Create or join a travel room to start planning!
        </p>
      </header>

      {/* Main content area, centered */}
      <main className="flex-grow container px-4 py-8 flex items-center justify-center">
        {/* Card containing the RoomSelector */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 w-full max-w-md">
          {/* Render the RoomSelector component and pass the async handler */}
          <RoomSelector onRoomSelected={handleRoomSelected} />
        </div>
      </main>

       {/* Optional Footer */}
       <footer className="py-4 text-center text-sm text-gray-500">
         <p>© {new Date().getFullYear()} RoamMates - Find your perfect group holiday</p>
       </footer>
    </div>
  );
};

// Export the component
export default GroupjcPage; 
