"use client";

import { Interview, Question } from "@/types/interview";
import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Plus, SaveIcon, TrashIcon } from "lucide-react";
import { useInterviewers } from "@/contexts/interviewers.context";
import QuestionCard from "@/components/dashboard/interview/create-popup/questionCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useInterviews } from "@/contexts/interviews.context";
import { InterviewService } from "@/services/interviews.service";
import { CardTitle } from "../../ui/card";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { NumberInput } from "./create-popup/NumberInput";

type EditInterviewProps = {
  interview: Interview | undefined;
};

function EditInterview({ interview }: EditInterviewProps) {
  const { interviewers } = useInterviewers();
  const { fetchInterviews } = useInterviews();

  const [description, setDescription] = useState<string>(
    interview?.description || "",
  );
  const [objective, setObjective] = useState<string>(
    interview?.objective || "",
  );
  const [numQuestions, setNumQuestions] = useState<number>(
    interview?.question_count || 1,
  );
  const [duration, setDuration] = useState<number>(
    Number(interview?.time_duration),
  );
  const [questions, setQuestions] = useState<Question[]>(
    interview?.questions || [],
  );
  const [selectedInterviewer, setSelectedInterviewer] = useState(
    interview?.interviewer_id,
  );
  const [isAnonymous, setIsAnonymous] = useState<boolean>(
    interview?.is_anonymous || false,
  );

  const [isClicked, setIsClicked] = useState(false);

  const endOfListRef = useRef<HTMLDivElement>(null);
  const prevQuestionLengthRef = useRef(questions.length);
  const router = useRouter();

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
    setNumQuestions(numQuestions - 1);
  };

  const handleAddQuestion = () => {
    if (questions.length < numQuestions) {
      setQuestions([
        ...questions,
        { id: uuidv4(), question: "", follow_up_count: 1 },
      ]);
    }
  };

  const onSave = async () => {
    const questionCount =
      questions.length < numQuestions ? questions.length : numQuestions;

    const interviewData = {
      objective: objective,
      questions: questions,
      interviewer_id: Number(selectedInterviewer),
      question_count: questionCount,
      time_duration: Number(duration),
      description: description,
      is_anonymous: isAnonymous,
    };

    try {
      if (!interview) {
        return;
      }
      const response = await InterviewService.updateInterview(
        interviewData,
        interview?.id,
      );
      setIsClicked(false);
      fetchInterviews();
      toast.success("Interview updated successfully.", {
        position: "bottom-right",
        duration: 3000,
      });
      router.push(`/interviews/${interview?.id}`);
    } catch (error) {
      console.error("Error creating interview:", error);
    }
  };

  const onDeleteInterviewClick = async () => {
    if (!interview) {
      return;
    }

    try {
      await InterviewService.deleteInterview(interview.id);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("Failed to delete the interview.", {
        position: "bottom-right",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    if (questions.length > prevQuestionLengthRef.current) {
      endOfListRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevQuestionLengthRef.current = questions.length;
  }, [questions.length]);

  return (
    <div className="h-screen z-[10] mx-2">
      <div className="flex flex-col bg-gray-100 rounded-md min-h-[120px] p-4 shadow-sm">

        {/* Back Button */}
        <div
          className="flex items-center text-indigo-600 hover:text-indigo-800 cursor-pointer w-fit"
          onClick={() => router.push(`/interviews/${interview?.id}`)}
        >
          <ArrowLeft size={18} className="mr-1" />
          <span className="text-sm font-semibold">Back to Summary</span>
        </div>

        {/* Description + Action Buttons */}
        <div className="flex justify-between items-center mt-3">
          <p className="font-medium text-sm ml-1">
            Interview Description
            <span className="text-xs ml-2 font-normal text-gray-600">
              (Visible to interviewees)
            </span>
          </p>

          <div className="flex gap-3 items-center">
            <Button
              disabled={isClicked}
              className="bg-indigo-600 hover:bg-indigo-800 mt-2"
              onClick={() => {
                setIsClicked(true);
                onSave();
              }}
            >
              Save
              <SaveIcon size={16} className="ml-2" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger>
                <Button
                  disabled={isClicked}
                  className="bg-red-500 hover:bg-red-600 mt-2 p-2"
                >
                  <TrashIcon size={16} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    this interview.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-indigo-600 hover:bg-indigo-800"
                    onClick={onDeleteInterviewClick}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Description Input */}
        <textarea
          value={description}
          className="input-textarea"
          placeholder="Enter your interview description here."
          rows={3}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={(e) => setDescription(e.target.value.trim())}
        />

        {/* Objective Input */}
        <p className="mt-3 mb-1 ml-1 font-medium text-sm">Objective</p>
        <textarea
          value={objective}
          className="input-textarea"
          placeholder="Enter your interview objective here."
          rows={3}
          onChange={(e) => setObjective(e.target.value)}
          onBlur={(e) => setObjective(e.target.value.trim())}
        />

        {/* Interviewer Section */}
        <div className="mt-4">
          <p className="mb-1 ml-1 font-medium text-sm">Interviewer</p>
          <div className="flex items-center">
            <div
              id="slider-3"
              className="h-32 pt-1 ml-1 overflow-x-auto whitespace-nowrap scroll-smooth scrollbar-hide w-[27.5rem]"
            >
              {interviewers.map((item) => (
                <div
                  className="inline-block px-2 cursor-pointer hover:scale-105 duration-300"
                  key={item.id}
                >
                  <div
                    className={`w-[96px] h-[96px] overflow-hidden rounded-full border-4 ${selectedInterviewer === item.id
                        ? "border-indigo-600"
                        : "border-transparent"
                      }`}
                    onClick={() => setSelectedInterviewer(item.id)}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-center text-xs mt-1">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Anonymous Switch */}
        <label className="flex flex-col mt-3 ml-1">
          <div className="flex items-center cursor-pointer">
            <span className="text-sm font-medium">
              Should responses be anonymous?
            </span>
            <Switch
              checked={isAnonymous}
              className="ml-4 mt-1 border-2 border-gray-300"
              onCheckedChange={setIsAnonymous}
            />
          </div>
          <span className="text-xs italic text-gray-600 mt-1">
            If disabled, respondent email & name will be collected.
          </span>
        </label>

        {/* Question Inputs */}
        <div className="flex w-[75%] justify-between gap-3 ml-1 mt-4">
          <NumberInput
            label="No. of Questions:"
            value={numQuestions}
            max={5}
            min={questions.length}
            onChange={setNumQuestions}
          />
          <NumberInput
            label="Duration (mins):"
            value={duration}
            max={10}
            min={1}
            onChange={setDuration}
          />
        </div>

        {/* Questions Section */}
        <p className="mt-3 mb-1 ml-1 font-medium text-sm">Questions</p>

        <ScrollArea className="questions-scroll">
          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              questionNumber={index + 1}
              questionData={question}
              onDelete={handleDeleteQuestion}
              onQuestionChange={handleInputChange}
            />
          ))}

          {questions.length < numQuestions && (
            <div
              className="text-center w-fit mx-auto mt-2 cursor-pointer opacity-80 hover:opacity-100"
              onClick={handleAddQuestion}
            >
              <Plus size={45} className="text-indigo-600" strokeWidth={2.2} />
            </div>
          )}
        </ScrollArea>
      </div>
    </div>

  );
}

export default EditInterview;
