import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { availableTags } from "@/lib/mockData";
import { toast } from "@/components/ui/sonner";

import { createClient } from '@supabase/supabase-js';

// Setup Supabase client (you can move this to a separate utils file)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface TagSelectorProps {
  userId: string;
  onTagsSelected: (tags: string[]) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ userId, onTagsSelected }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleTagClick = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tagId]);
    } else {
      toast.error("You can only select up to 3 tags");
    }
  };

  const handleContinue = async () => {

    if (selectedTags.length !== 3) {
      toast.error("Please select exactly 3 tags");
      return;
    }

    if (!userId.trim()) {
      toast.error("Please enter your User ID before continuing");
      return;
    }

    console.log("Submitting to SupaBase:", {
      userId,
      selectedTags,
    });
    

    console.log("Submitting directly to Supabase:", { userId, selectedTags });

    // Step 1: Insert the user selection
    const { data: selection, error: selectionError } = await supabase
      .from("user_selections")
      .insert([{ name: userId, selected_tags: selectedTags }])
      .select()
      .single();

    if (selectionError) {
      console.error(selectionError);
      toast.error("Failed to save your selection.");
      return;
    }

    // Step 2: Call Supabase function to get top 10 matching cities
    const { data: cities, error: rpcError } = await supabase.rpc("get_recommended_cities", {
      input_tags: selectedTags,
    });

    if (rpcError) {
      console.error(rpcError);
      toast.error("Failed to fetch recommendations.");
      return;
    }

    // Step 3: Store the top 10 cities
    await supabase.from("recommendations").insert(
      cities.map((c: any) => ({
        selection_id: selection.id,
        city: c.city,
      }))
    );

    console.log("Recommended cities:", cities);
    onTagsSelected(selectedTags); // move to game screen

  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-center">What are you looking for?</h2>
      <p className="text-gray-500 mb-6 text-center">Select 3 tags that match your ideal holiday</p>

      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {availableTags.map((tag) => (
          <button
            key={tag.id}
            className={`tag-pill ${selectedTags.includes(tag.id) ? "tag-pill-selected" : "tag-pill-unselected"}`}
            onClick={() => handleTagClick(tag.id)}
          >
            {tag.name}
          </button>
        ))}
      </div>

      <div className="text-center mb-4">
        <span className="text-holiday-darkGray">{selectedTags.length}/3 tags selected</span>
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
