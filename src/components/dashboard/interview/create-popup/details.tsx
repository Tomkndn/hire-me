import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useInterviewers } from "@/contexts/interviewers.context";
import { InterviewBase, Question } from "@/types/interview";
import { ChevronRight, ChevronLeft, Info } from "lucide-react";
import Image from "next/image";
import { CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import FileUpload from "../fileUpload";
import Modal from "@/components/dashboard/Modal";
import InterviewerDetailsModal from "@/components/dashboard/interviewer/interviewerDetailsModal";
import { Interviewer } from "@/types/interviewer";
import { safeJsonParse } from "@/lib/jsonParse";

interface Props {
  open: boolean;
  setLoading: (loading: boolean) => void;
  interviewData: InterviewBase;
  setInterviewData: (interviewData: InterviewBase) => void;
  isUploaded: boolean;
  setIsUploaded: (isUploaded: boolean) => void;
  fileName: string;
  setFileName: (fileName: string) => void;
}

function DetailsPopup({
  open,
  setLoading,
  interviewData,
  setInterviewData,
  isUploaded,
  setIsUploaded,
  fileName,
  setFileName,
}: Props) {
  const { interviewers } = useInterviewers();
  const [isClicked, setIsClicked] = useState(false);
  const [openInterviewerDetails, setOpenInterviewerDetails] = useState(false);
  const [interviewerDetails, setInterviewerDetails] = useState<Interviewer>();

  const [name, setName] = useState(interviewData.name);
  const [selectedInterviewer, setSelectedInterviewer] = useState(
    interviewData.interviewer_id,
  );
  const [objective, setObjective] = useState(interviewData.objective);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(
    interviewData.is_anonymous,
  );
  const [numQuestions, setNumQuestions] = useState(
    interviewData.question_count == 0
      ? ""
      : String(interviewData.question_count),
  );
  const [duration, setDuration] = useState(interviewData.time_duration);
  const [uploadedDocumentContext, setUploadedDocumentContext] = useState("");

  const slideLeft = (id: string, value: number) => {
    var slider = document.getElementById(`${id}`);
    if (slider) {
      slider.scrollLeft = slider.scrollLeft - value;
    }
  };

  const slideRight = (id: string, value: number) => {
    var slider = document.getElementById(`${id}`);
    if (slider) {
      slider.scrollLeft = slider.scrollLeft + value;
    }
  };

  const onGenrateQuestions = async () => {
    setLoading(true);

    const data = {
      name: name.trim(),
      objective: objective.trim(),
      number: numQuestions,
      context: uploadedDocumentContext,
    };

    const generatedQuestions = (await axios.post(
      "/api/generate-interview-questions",
      data,
    )) as any;

    const generatedQuestionsResponse = safeJsonParse(
  generatedQuestions?.data?.response
);

    const updatedQuestions = generatedQuestionsResponse.questions.map(
      (question: Question) => ({
        id: uuidv4(),
        question: question.question.trim(),
        follow_up_count: 1,
      }),
    );

    const updatedInterviewData = {
      ...interviewData,
      name: name.trim(),
      objective: objective.trim(),
      questions: updatedQuestions,
      interviewer_id: selectedInterviewer,
      question_count: Number(numQuestions),
      time_duration: duration,
      description: generatedQuestionsResponse.description,
      is_anonymous: isAnonymous,
    };
    setInterviewData(updatedInterviewData);
  };

  const onManual = () => {
    setLoading(true);

    const updatedInterviewData = {
      ...interviewData,
      name: name.trim(),
      objective: objective.trim(),
      questions: [{ id: uuidv4(), question: "", follow_up_count: 1 }],
      interviewer_id: selectedInterviewer,
      question_count: Number(numQuestions),
      time_duration: String(duration),
      description: "",
      is_anonymous: isAnonymous,
    };
    setInterviewData(updatedInterviewData);
  };

  useEffect(() => {
    if (!open) {
      setName("");
      setSelectedInterviewer(BigInt(0));
      setObjective("");
      setIsAnonymous(false);
      setNumQuestions("");
      setDuration("");
      setIsClicked(false);
    }
  }, [open]);

  return (
    <>
      <div className="text-center w-[40rem]">
        {/* Title */}
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
          Create an Interview
        </h1>

        <div className="flex flex-col justify-center items-start mt-6 ml-10 mr-8 max-h-[75vh] overflow-y-auto pr-2 pb-4 pt-36">

          {/* Interview Name */}
          <div className="flex flex-col w-full">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Interview Name
            </label>
            <input
              type="text"
              className="border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white/80 backdrop-blur-sm rounded-md px-3 py-2 text-sm w-full transition"
              placeholder="e.g. Java Backend Screening"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={(e) => setName(e.target.value.trim())}
            />
          </div>

          {/* Select Interviewer */}
          <label className="text-sm mt-5 font-medium text-gray-700">
            Select an Interviewer
          </label>
          <div className="relative flex items-center mt-2">
            <div
              id="slider-3"
              className="h-36 pt-1 overflow-x-scroll whitespace-nowrap scroll-smooth scrollbar-hide w-[27.5rem]"
            >
              {interviewers.map((item) => (
                <div
                  className="inline-block cursor-pointer mx-3 text-center"
                  key={item.id}
                >
                  <button
                    className="absolute ml-8 mt-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInterviewerDetails(item);
                      setOpenInterviewerDetails(true);
                    }}
                  >
                    <Info size={18} className="text-indigo-600" strokeWidth={2.2} />
                  </button>

                  <div
                    className={`w-[96px] rounded-full border-4 transition-all ${selectedInterviewer === item.id
                      ? "border-indigo-600 shadow-md shadow-indigo-200"
                      : "border-transparent"
                      }`}
                    onClick={() => setSelectedInterviewer(item.id)}
                  >
                    <Image
                      src={item.image}
                      alt="Interviewer"
                      width={70}
                      height={70}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <CardTitle className="mt-1 text-xs font-medium text-gray-700">
                    {item.name}
                  </CardTitle>
                </div>
              ))}
            </div>

            {interviewers.length > 4 && (
              <div className="flex flex-col justify-center ml-4 space-y-4">
                <ChevronRight
                  className="opacity-50 cursor-pointer hover:opacity-100"
                  size={24}
                  onClick={() => slideRight("slider-3", 115)}
                />
                <ChevronLeft
                  className="opacity-50 cursor-pointer hover:opacity-100"
                  size={24}
                  onClick={() => slideLeft("slider-3", 115)}
                />
              </div>
            )}
          </div>

          {/* Objective */}
          <label className="text-sm font-medium mt-3 text-gray-700">Objective</label>
          <Textarea
            value={objective}
            className="h-24 mt-2 border border-indigo-200 bg-white/80 backdrop-blur-sm rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 w-[33.2rem] text-sm transition"
            placeholder="e.g. Evaluate technical problem solving & backend design skills."
            onChange={(e) => setObjective(e.target.value)}
            onBlur={(e) => setObjective(e.target.value.trim())}
          />

          {/* Document Upload */}
          <label className="text-sm font-medium mt-4 text-gray-700">
            Upload Documents (Optional)
          </label>
          <FileUpload
            isUploaded={isUploaded}
            setIsUploaded={setIsUploaded}
            fileName={fileName}
            setFileName={setFileName}
            setUploadedDocumentContext={setUploadedDocumentContext}
          />

          {/* Anonymous Switch */}
          <div className="mt-6">
            <label className="flex items-center cursor-pointer">
              <span className="text-sm font-medium text-gray-700">
                Prefer anonymous responses?
              </span>
              <Switch
                checked={isAnonymous}
                className={`ml-4 mt-1 ${isAnonymous ? "bg-indigo-600" : "bg-gray-300"
                  }`}
                onCheckedChange={(checked) => setIsAnonymous(checked)}
              />
            </label>
            <span className="text-[0.7rem] italic text-gray-500">
              If disabled, we’ll collect the interviewee’s name and email.
            </span>
          </div>

          {/* Number Inputs */}
          <div className="flex flex-row gap-4 justify-between w-full mt-4">

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">
                Number of Questions
              </label>
              <input
                type="number"
                step="1"
                max="5"
                min="1"
                className="border border-indigo-200 bg-white/80 rounded-md text-center focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 w-20 py-1 transition text-sm"
                value={numQuestions}
                onChange={(e) => {
                  let value = e.target.value;
                  if (value === "" || (Number.isInteger(Number(value)) && Number(value) > 0)) {
                    if (Number(value) > 5) { value = "5" };
                    setNumQuestions(value);
                  }
                }}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">
                Duration (mins)
              </label>
              <input
                type="number"
                step="1"
                max="10"
                min="1"
                className="border border-indigo-200 bg-white/80 rounded-md text-center focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 w-20 py-1 transition text-sm"
                value={duration}
                onChange={(e) => {
                  let value = e.target.value;
                  if (value === "" || (Number.isInteger(Number(value)) && Number(value) > 0)) {
                    if (Number(value) > 10) { value = "10" };
                    setDuration(value);
                  }
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row w-full justify-center items-center gap-10 mt-7">
            <Button
              disabled={
                (name && objective && numQuestions && duration && selectedInterviewer != BigInt(0)
                  ? false
                  : true) || isClicked
              }
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 w-40 shadow-md shadow-indigo-200 text-white transition"
              onClick={() => {
                setIsClicked(true);
                onGenrateQuestions();
              }}
            >
              Generate Questions
            </Button>
            <Button
              disabled={
                (name && objective && numQuestions && duration && selectedInterviewer != BigInt(0)
                  ? false
                  : true) || isClicked
              }
              className="bg-indigo-600 hover:bg-indigo-800 text-white w-40 shadow shadow-indigo-200"
              onClick={() => {
                setIsClicked(true);
                onManual();
              }}
            >
              I&apos;ll do it myself
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={openInterviewerDetails}
        closeOnOutsideClick={true}
        onClose={() => {
          setOpenInterviewerDetails(false);
        }}
      >
        <InterviewerDetailsModal interviewer={interviewerDetails} />
      </Modal>
    </>
  );
}

export default DetailsPopup;
