"use client";

import { Card, CardContent } from "@/components/ui/card";
import { InterviewerService } from "@/services/interviewers.service";
import axios from "axios";
import { Plus, Loader2 } from "lucide-react";
import { useState } from "react";

function CreateInterviewerButton() {
  const [isLoading, setIsLoading] = useState(false);

  const createInterviewers = async () => {
    setIsLoading(true);
    const response = await axios.get("/api/create-interviewer", {});
    console.log(response);
    setIsLoading(false);
    InterviewerService.getAllInterviewers();
  };

  return (
    <>
      <Card
        className="inline-block cursor-pointer hover:scale-[1.04] transition-all duration-300 
             h-40 w-36 ml-1 mr-3 rounded-xl shrink-0 overflow-hidden shadow-lg 
             bg-white/60 backdrop-blur-md border border-indigo-200 hover:border-indigo-300"
        onClick={() => createInterviewers()}
      >
        <CardContent className="p-0 flex flex-col justify-center items-center">
          <div className="w-full h-20 flex justify-center items-center">
            {isLoading ? (
              <Loader2 size={38} className="animate-spin text-indigo-600 opacity-80" />
            ) : (
              <Plus size={38} className="text-indigo-500 opacity-90" />
            )}
          </div>

          <p className="mt-3 text-[11px] text-gray-700 font-medium px-2 text-center leading-tight">
            Create two Default Interviewers
          </p>
        </CardContent>
      </Card>

    </>
  );
}

export default CreateInterviewerButton;
