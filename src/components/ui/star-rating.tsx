import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export const StarRating = ({ onChange }: { onChange?: (value: number) => void }) => {
  const [rating, setRating] = useState(0);

  const handleClick = (value: number) => {
    setRating(value);
    onChange?.(value);
  };

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Button
          key={i}
          variant="ghost"
          size="icon"
          onClick={() => handleClick(i)}
          className="p-1"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              i <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        </Button>
      ))}
    </div>
  );
};
