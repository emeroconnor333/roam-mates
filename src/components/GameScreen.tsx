
import React, { useState, useEffect } from "react";
import CityCard from "./CityCard";
import { City, getFilteredCities } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

interface GameScreenProps {
  selectedTags: string[];
  onGameComplete: (winningCity: City) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ selectedTags, onGameComplete }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [currentPair, setCurrentPair] = useState<[City, City] | null>(null);
  const [roundCount, setRoundCount] = useState(0);
  const [matchHistory, setMatchHistory] = useState<City[]>([]);
  const totalRounds = 10;
  
  // Initialize the game with filtered cities based on selected tags
  useEffect(() => {
    const filteredCities = getFilteredCities(selectedTags);
    if (filteredCities.length < 2) {
      toast.error("Not enough cities match your criteria. Please try different tags.");
      return;
    }
    
    setCities(filteredCities);
    
    // Pick initial pair
    const initialPair: [City, City] = [
      filteredCities[0],
      filteredCities[1]
    ];
    
    setCurrentPair(initialPair);
  }, [selectedTags]);

  const selectCity = (selectedCity: City) => {
    if (!currentPair) return;
    
    // Add the selected city to match history
    const updatedHistory = [...matchHistory, selectedCity];
    setMatchHistory(updatedHistory);
    
    const newRoundCount = roundCount + 1;
    setRoundCount(newRoundCount);
    
    if (newRoundCount >= totalRounds) {
      // Game complete
      onGameComplete(selectedCity);
      return;
    }
    
    // Find the next city to compare against the winner
    const remainingCities = cities.filter(
      city => city.id !== selectedCity.id && 
      !matchHistory.some(c => c.id === city.id)
    );
    
    if (remainingCities.length === 0) {
      // Not enough cities to continue
      toast.error("Ran out of cities to compare. Ending game early.");
      onGameComplete(selectedCity);
      return;
    }
    
    // Create the next pair
    const nextCityIndex = Math.floor(Math.random() * remainingCities.length);
    setCurrentPair([
      selectedCity, 
      remainingCities[nextCityIndex]
    ]);
  };
  
  // If no cities are available, show an error message
  if (!cities.length || !currentPair) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">Loading destinations...</p>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-1">Which destination do you prefer?</h2>
        <p className="text-gray-500 mb-2">Click on your favorite to continue</p>
        <div className="inline-block bg-holiday-softPurple px-4 py-1 rounded-full">
          <span className="text-holiday-secondary font-medium">
            Round {roundCount + 1}/{totalRounds}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
        <div className="card-container">
          <CityCard city={currentPair[0]} onClick={() => selectCity(currentPair[0])} />
        </div>
        <div className="card-container">
          <CityCard city={currentPair[1]} onClick={() => selectCity(currentPair[1])} />
        </div>
      </div>
      
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          Can't decide? Keep comparing to find your perfect match!
        </p>
      </div>
    </div>
  );
};

export default GameScreen;
