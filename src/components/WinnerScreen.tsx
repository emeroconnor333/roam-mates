
import React from "react";
import CityCard from "./CityCard";
import { Button } from "@/components/ui/button";
import { City } from "@/lib/mockData";
import confetti from "canvas-confetti";
import { Heart } from "lucide-react";

interface WinnerScreenProps {
  winningCity: City;
  onPlayAgain: () => void;
}

const WinnerScreen: React.FC<WinnerScreenProps> = ({ winningCity, onPlayAgain }) => {
  React.useEffect(() => {
    // Trigger confetti when the winner is shown
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="w-full max-w-md mx-auto text-center animate-bounce-in">
      <div className="flex justify-center mb-4">
        <Heart className="text-holiday-red mr-2" size={28} fill="#ea384c" />
        <h2 className="text-2xl font-bold">You've found your match!</h2>
        <Heart className="text-holiday-red ml-2" size={28} fill="#ea384c" />
      </div>
      
      <p className="text-gray-600 mb-6">
        Based on your preferences, we think you'll love:
      </p>
      
      <div className="mb-8">
        <CityCard city={winningCity} isWinner={true} />
      </div>
      
      <Button
        className="bg-holiday-primary hover:bg-holiday-secondary transition-colors"
        onClick={onPlayAgain}
      >
        Start Over
      </Button>
    </div>
  );
};

export default WinnerScreen;
