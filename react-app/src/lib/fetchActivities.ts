// src/lib/fetchActivities.ts

import { supabase } from './supabaseClient'; // Import your configured Supabase client

// Define the structure for the activity data (matches teammate's format)
export interface ActivityCard {
  id: string;
  title: string;
  description: string;
  labels?: string[]; // Labels are optional
}

/**
 * Fetches activities from the Supabase 'activities' table for a specific room code.
 * @param roomCode - The room code to filter activities by.
 * @returns A promise that resolves to an array of ActivityCard objects or null if an error occurs.
 */
export const fetchActivitiesForRoom = async (roomCode: string): Promise<ActivityCard[] | null> => {
  // Check if a valid roomCode was provided
  if (!roomCode) {
    console.error("fetchActivitiesForRoom: No roomCode provided.");
    return null; // Or return an empty array: return [];
  }

  console.log(`Fetching activities for room: ${roomCode}`);

  try {
    // Query the 'activities' table in Supabase
    const { data, error } = await supabase
      .from('activities') // Your table name
      .select('id, title, description, labels') // Select the required columns
      .eq('room_code', roomCode); // Filter by the room_code column matching the provided roomCode

    // Handle potential errors during the fetch
    if (error) {
      console.error("Error fetching activities:", error.message);
      // Depending on your error handling strategy, you might throw the error
      // or return null/empty array
      // throw error; 
      return null;
    }

    // Log the fetched data (optional)
    console.log("Fetched activities:", data);

    // Ensure data is not null and return it (Supabase returns null if no rows match)
    // The fetched data should already match the ActivityCard structure if columns are named correctly.
    return data || []; // Return the data, or an empty array if no activities were found

  } catch (err) {
    console.error("Unexpected error in fetchActivitiesForRoom:", err);
    return null; // Return null in case of unexpected errors
  }
};
