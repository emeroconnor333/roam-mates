
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { availableTags } from "@/lib/mockData";
import { toast } from "@/components/ui/sonner";

interface TagSelectorProps {
  onTagsSelected: (tags: string[]) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ onTagsSelected }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const handleTagClick = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      // Remove tag
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else if (selectedTags.length < 3) {
      // Add tag if less than 3 tags are selected
      setSelectedTags([...selectedTags, tagId]);
    } else {
      // Show error message if trying to select more than 3 tags
      toast.error("You can only select up to 3 tags");
    }
  };
  
  const handleContinue = () => {
    if (selectedTags.length === 3) {
      onTagsSelected(selectedTags);
    } else {
      toast.error("Please select exactly 3 tags");
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-center">What are you looking for?</h2>
      <p className="text-gray-500 mb-6 text-center">Select 3 tags that match your ideal holiday</p>
      
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {availableTags.map((tag) => (
          <button
            key={tag.id}
            className={`tag-pill ${selectedTags.includes(tag.id) ? 'tag-pill-selected' : 'tag-pill-unselected'}`}
            onClick={() => handleTagClick(tag.id)}
          >
            {tag.name}
          </button>
        ))}
      </div>
      
      <div className="text-center mb-4">
        <span className="text-holiday-darkGray">
          {selectedTags.length}/3 tags selected
        </span>
      </div>
      
      <Button 
        className="w-full bg-holiday-primary hover:bg-holiday-secondary transition-colors"
        onClick={handleContinue}
        disabled={selectedTags.length !== 3}
      >
        Continue to Matching
      </Button>
    </div>
  );
};

export default TagSelector;
