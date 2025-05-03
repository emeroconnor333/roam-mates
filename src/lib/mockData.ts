
export interface Tag {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  imageUrl: string;
  description: string;
  tags: string[];
}

export const availableTags: Tag[] = [
  { id: "nightlife_and_entertainment", name: "Nightlife & Entertainment" },
  { id: "underrated_destinations", name: "Underrated Destinations" },
  { id: "beach", name: "Beach" },
  { id: "art_and_culture", name: "Art & Culture" },
  { id: "family_friendly", name: "Family Friendly" },
  { id: "great_food", name: "Great Food" },
  { id: "outdoor_activities", name: "Outdoor Activities" },
];

export const mockCities: City[] = [
  {
    id: "1",
    name: "Barcelona",
    country: "Spain",
    imageUrl: "https://images.unsplash.com/photo-1464790719320-516ecd75af6c",
    description: "A vibrant city with stunning architecture, beautiful beaches, and amazing nightlife.",
    tags: ["nightlife_and_entertainment", "beach", "art_and_culture"]
  },
  {
    id: "2",
    name: "Kyoto",
    country: "Japan",
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
    description: "Immerse yourself in traditional Japanese culture with beautiful temples and gardens.",
    tags: ["art_and_culture", "art_and_culture", "great_food"]
  },
  {
    id: "3",
    name: "Bali",
    country: "Indonesia",
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
    description: "Tropical paradise with stunning beaches, vibrant culture and lush landscapes.",
    tags: ["beach", "outdoor-activities"]
  },
  {
    id: "4",
    name: "New York City",
    country: "USA",
    imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9",
    description: "The city that never sleeps offers world-class restaurants, shopping and culture.",
    tags: ["nightlife_and_entertainment", "art_and_culture"]
  },
  {
    id: "5",
    name: "Rome",
    country: "Italy",
    imageUrl: "https://images.unsplash.com/photo-1525874684015-58379d421a52",
    description: "Step back in time with ancient ruins, delicious cuisine and romantic atmosphere.",
    tags: ["art_and_culture", "great_food"]
  },
  {
    id: "6",
    name: "Bangkok",
    country: "Thailand",
    imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5",
    description: "Bustling city with vibrant street life, beautiful temples and amazing food.",
    tags: ["great_food","nightlife_and_entertainment"]
  },
  {
    id: "7",
    name: "Cape Town",
    country: "South Africa",
    imageUrl: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99",
    description: "Stunning landscapes, beaches and wildlife alongside a vibrant urban scene.",
    tags: ["outdoor_activities", "beach", "great_food"]
  },
  {
    id: "8",
    name: "Reykjavik",
    country: "Iceland",
    imageUrl: "https://plus.unsplash.com/premium_photo-1661962984700-16b03ecda58a?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Gateway to natural wonders with northern lights, volcanoes and hot springs.",
    tags: ["outdoor_activities", "art_and_culture"]
  },
  {
    id: "9",
    name: "Marrakech",
    country: "Morocco",
    imageUrl: "https://images.unsplash.com/photo-1597212618440-806262de4f6b",
    description: "Exotic markets, beautiful architecture and vibrant colors in this historic city.",
    tags: ["outdoor_activities", "great_food"]
  },
  {
    id: "10",
    name: "Sydney",
    country: "Australia",
    imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9",
    description: "Beautiful harbor city with iconic landmarks, great beaches and outdoor lifestyle.",
    tags: ["beach", "outdoor_activities"]
  },
  {
    id: "11",
    name: "Amsterdam",
    country: "Netherlands",
    imageUrl: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017",
    description: "Picturesque canals, cycling culture and rich arts scene in this liberal city.",
    tags: ["art_and_culture", "nightlife_and_entertainment"]
  },
  {
    id: "12",
    name: "Costa Rica",
    country: "Costa Rica",
    imageUrl: "https://images.unsplash.com/photo-1518093165763-0c9c1d6514c0",
    description: "Lush rainforests, beautiful beaches and abundant wildlife in this eco-paradise.",
    tags: ["outdoor_activities", "beach"]
  }
  
];

export function getFilteredCities(selectedTags: string[]): City[] {
  if (!selectedTags.length) return mockCities;
  
  return mockCities.filter(city => {
    return selectedTags.some(tag => city.tags.includes(tag));
  });
}

export function getRandomCity(excludeIds: string[] = []): City | null {
  const availableCities = mockCities.filter(city => !excludeIds.includes(city.id));
  if (availableCities.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * availableCities.length);
  return availableCities[randomIndex];
}
