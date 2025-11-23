import { Question } from "@/types/interview";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuestionCardProps {
  questionNumber: number;
  questionData: Question;
  onQuestionChange: (id: string, question: Question) => void;
  onDelete: (id: string) => void;
}

const questionCard = ({
  questionNumber,
  questionData,
  onQuestionChange,
  onDelete,
}: QuestionCardProps) => {
  return (
    <>
      <Card className="shadow-sm border border-slate-200 rounded-xl mb-6 bg-white/90 backdrop-blur-md">
        <CardContent className="px-5 py-4">

          {/* Header Row */}
          <div className="flex items-center justify-between mb-3">
            <CardTitle className="text-lg font-semibold">
              Question {questionNumber}
            </CardTitle>

            {/* Depth Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Depth:</span>

              {[
                { label: "Low", value: 1, tip: "Brief follow-up" },
                { label: "Medium", value: 2, tip: "Moderate follow-up" },
                { label: "High", value: 3, tip: "In-depth follow-up" },
              ].map(({ label, value, tip }) => {
                const active = questionData?.follow_up_count === value;

                return (
                  <TooltipProvider key={value}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className={`text-xs h-7 px-2 rounded-md transition-all 
                    ${active
                              ? "bg-indigo-600 text-white"
                              : "bg-indigo-50 text-indigo-500 hover:bg-indigo-100"
                            }`}
                          onClick={() =>
                            onQuestionChange(questionData.id, {
                              ...questionData,
                              follow_up_count: value,
                            })
                          }
                        >
                          {label}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-white border shadow-sm text-zinc-700">
                        {tip}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>

          {/* Question Input + Delete */}
          <div className="flex items-start gap-3">

            <textarea
              value={questionData?.question}
              placeholder="e.g. Can you tell me about a challenging project you’ve worked on?"
              className="mt-1 w-full px-3 py-2 text-sm border border-slate-300 rounded-md
        focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
        resize-none bg-white"
              rows={3}
              onChange={(e) =>
                onQuestionChange(questionData.id, {
                  ...questionData,
                  question: e.target.value,
                })
              }
              onBlur={(e) =>
                onQuestionChange(questionData.id, {
                  ...questionData,
                  question: e.target.value.trim(),
                })
              }
            />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="mt-1 p-2 rounded-lg border border-red-200 text-red-500 
                    hover:bg-red-50 hover:border-red-300 transition-all"
                    onClick={() => onDelete(questionData.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-white border shadow-sm text-red-600">
                  Delete Question
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

        </CardContent>
      </Card>

    </>
  );
};
export default questionCard;
