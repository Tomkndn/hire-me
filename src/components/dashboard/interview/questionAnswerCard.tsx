import { CardTitle } from "@/components/ui/card";

interface QuestionCardProps {
  questionNumber: number;
  question: string;
  answer: string;
}

function QuestionAnswerCard({
  questionNumber,
  question,
  answer,
}: QuestionCardProps) {
  return (
    <>
      <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-3 mb-3 hover:shadow-md transition">
        <div className="flex items-start gap-3">
          {/* Number */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500 text-white font-semibold text-base">
            {questionNumber}
          </div>

          {/* Question + Answer */}
          <div className="flex flex-col">
            <p className="font-semibold text-slate-900 leading-tight">
              {question}
            </p>
            <p className="text-slate-600 text-sm mt-1">
              {answer}
            </p>
          </div>
        </div>
      </div>

    </>
  );
}
export default QuestionAnswerCard;
