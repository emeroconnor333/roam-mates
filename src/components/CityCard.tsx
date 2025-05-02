
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { City, availableTags } from "@/lib/mockData";
import { MapPin } from "lucide-react";

interface CityCardProps {
  city: City;
  onClick?: () => void;
  isWinner?: boolean;
}

const CityCard: React.FC<CityCardProps> = ({ city, onClick, isWinner = false }) => {
  // Find the full tag objects that match the city's tag IDs
  const cityTags = availableTags.filter(tag => city.tags.includes(tag.id));
  
  return (
    <Card 
      className={`w-full max-w-sm mx-auto overflow-hidden rounded-xl shadow-lg transition-all 
      ${onClick ? 'hover:shadow-xl cursor-pointer transform hover:-translate-y-1' : 'cursor-default'}`}
      onClick={onClick}
    >
      {isWinner && (
        <div className="bg-holiday-primary text-white text-center py-2 font-bold">
          Winning Destination
        </div>
      )}
      
      <div className="relative h-60 overflow-hidden">
        <img 
          src={city.imageUrl} 
          alt={city.name} 
          className="object-cover w-full h-full"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center text-white">
            <h3 className="text-xl font-bold">{city.name}</h3>
            <div className="flex items-center ml-2">
              <MapPin size={16} className="mr-1" />
              <span className="text-sm">{city.country}</span>
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <p className="text-gray-600 mb-4">{city.description}</p>
        
        <div className="flex flex-wrap gap-2">
          {cityTags.map(tag => (
            <span 
              key={tag.id} 
              className="tag-pill bg-holiday-softPurple text-holiday-secondary"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CityCard;
