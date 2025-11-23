import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FeedbackData } from "@/types/response";

enum SatisfactionLevel {
  Positive = "😀",
  Moderate = "😐",
  Negative = "😔",
}

interface FeedbackFormProps {
  onSubmit: (data: Omit<FeedbackData, "interview_id">) => void;
  email: string;
}

export function FeedbackForm({ onSubmit, email }: FeedbackFormProps) {
  const [satisfaction, setSatisfaction] = useState<SatisfactionLevel>(
    SatisfactionLevel.Moderate,
  );
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    if (satisfaction !== null || feedback.trim() !== "") {
      onSubmit({
        satisfaction: Object.values(SatisfactionLevel).indexOf(satisfaction),
        feedback,
        email,
      });
    }
  };

  return (
    <div className="p-5 bg-white rounded-2xl shadow-sm border border-indigo-100 max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
        Are you satisfied with the platform?
      </h3>

      {/* Emoji Selection */}
      <div className="flex justify-center gap-3 mb-4">
        {Object.values(SatisfactionLevel).map((emoji) => (
          <button
            key={emoji}
            className={`text-3xl transition-all duration-200 p-2 rounded-xl 
              hover:scale-110 hover:bg-indigo-50 
              ${satisfaction === emoji
                ? "bg-indigo-100 border-2 border-indigo-500 scale-110"
                : "border border-transparent"
              }
              `}
              onClick={() => setSatisfaction(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Feedback Input */}
      <Textarea
        value={feedback}
        placeholder="Share your thoughts..."
        className="mb-4 rounded-xl border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
        onChange={(e) => setFeedback(e.target.value)}
      />

      {/* Submit Button */}
      <Button
        disabled={satisfaction === null && feedback.trim() === ""}
        className={`w-full rounded-xl text-white font-medium transition 
          ${satisfaction === null && feedback.trim() === ""
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
          }
          `}
          onClick={handleSubmit}
      >
        Submit Feedback
      </Button>
    </div>

  );
}
