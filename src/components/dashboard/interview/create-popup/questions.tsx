import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useClerk, useOrganization } from "@clerk/nextjs";
import { InterviewBase, Question } from "@/types/interview";
import { useInterviews } from "@/contexts/interviews.context";
import { ScrollArea } from "@/components/ui/scroll-area";
import QuestionCard from "@/components/dashboard/interview/create-popup/questionCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ChevronLeft } from "lucide-react";

interface Props {
  interviewData: InterviewBase;
  setProceed: (proceed: boolean) => void;
  setOpen: (open: boolean) => void;
}

function QuestionsPopup({ interviewData, setProceed, setOpen }: Props) {
  const { user } = useClerk();
  const { organization } = useOrganization();
  const [isClicked, setIsClicked] = useState(false);

  const [questions, setQuestions] = useState<Question[]>(
    interviewData.questions,
  );
  const [description, setDescription] = useState<string>(
    interviewData.description.trim(),
  );
  const { fetchInterviews } = useInterviews();

  const endOfListRef = useRef<HTMLDivElement>(null);
  const prevQuestionLengthRef = useRef(questions.length);

  const handleInputChange = (id: string, newQuestion: Question) => {
    setQuestions(
      questions.map((question) =>
        question.id === id ? { ...question, ...newQuestion } : question,
      ),
    );
  };

  const handleDeleteQuestion = (id: string) => {
    if (questions.length === 1) {
      setQuestions(
        questions.map((question) => ({
          ...question,
          question: "",
          follow_up_count: 1,
        })),
      );

      return;
    }
    setQuestions(questions.filter((question) => question.id !== id));
  };

  const handleAddQuestion = () => {
    if (questions.length < interviewData.question_count) {
      setQuestions([
        ...questions,
        { id: uuidv4(), question: "", follow_up_count: 1 },
      ]);
    }
  };

  const onSave = async () => {
    try {
      interviewData.user_id = user?.id || "";
      interviewData.organization_id = organization?.id || "";

      interviewData.questions = questions;
      interviewData.description = description;

      // Convert BigInts to strings if necessary
      const sanitizedInterviewData = {
        ...interviewData,
        interviewer_id: interviewData.interviewer_id.toString(),
        response_count: interviewData.response_count.toString(),
        logo_url: organization?.imageUrl || "",
      };

      const response = await axios.post("/api/create-interview", {
        organizationName: organization?.name,
        interviewData: sanitizedInterviewData,
      });
      setIsClicked(false);
      fetchInterviews();
      setOpen(false);
    } catch (error) {
      console.error("Error creating interview:", error);
    }
  };

  useEffect(() => {
    if (questions.length > prevQuestionLengthRef.current) {
      endOfListRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevQuestionLengthRef.current = questions.length;
  }, [questions.length]);

  return (
    <div className="space-y-4">

      {/* Header + Back */}
      <div className="flex flex-col justify-center items-center w-[38rem] mx-auto">
        <div className="relative w-full flex justify-center items-center py-1">
          <button
            className="absolute left-0 p-1 rounded-lg hover:bg-slate-100 transition"
            onClick={() => setProceed(false)}
          >
            <ChevronLeft size={28} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Create Interview</h1>
        </div>

        <p className="mt-2 text-sm text-left w-full text-gray-600 px-1">
          We will be using these questions during the interview. Please ensure they are appropriate and well-written.
        </p>

        {/* Scroll Area for Question Cards */}
        <ScrollArea
          className={`mt-3 w-full px-1 ${interviewData.question_count > 1 ? "h-[29rem]" : ""}`}
        >
          <div className="flex flex-col gap-4 pr-1">
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                questionNumber={index + 1}
                questionData={question}
                onDelete={handleDeleteQuestion}
                onQuestionChange={handleInputChange}
              />
            ))}
            <div ref={endOfListRef} />
          </div>
        </ScrollArea>

        {/* Add Question Button */}
        {questions.length < interviewData.question_count && (
          <button
          className="mt-4 group rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 p-3 transition cursor-pointer"
          onClick={handleAddQuestion}
          >
            <Plus size={40} className="text-indigo-600 group-hover:scale-110 transition" />
          </button>
        )}
      </div>

      {/* Interview Description */}
      <div className="px-2">
        <label className="block font-medium text-gray-800 mb-1">
          Interview Description
          <span className="block text-xs italic text-gray-500 font-light">
            Note: This description will be visible to the interviewee.
          </span>
        </label>

        <textarea
          value={description}
          placeholder="Enter a short description for this interview."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white
      focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
      hover:border-gray-400 transition"
          rows={3}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={(e) => setDescription(e.target.value.trim())}
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end w-full">
        <Button
          disabled={
            isClicked ||
            questions.length < interviewData.question_count ||
            description.trim() === "" ||
            questions.some((q) => q.question.trim() === "")
          }
          className="bg-indigo-600 hover:bg-indigo-800 mr-5 mt-2 transition"
          onClick={() => {
            setIsClicked(true);
            onSave();
          }}
        >
          Save
        </Button>
      </div>
    </div>

  );
}
export default QuestionsPopup;
