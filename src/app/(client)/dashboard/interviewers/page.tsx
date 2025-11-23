"use client";

import { useInterviewers } from "@/contexts/interviewers.context";
import React from "react";
import { ChevronLeft } from "lucide-react";
import { ChevronRight } from "lucide-react";
import InterviewerCard from "@/components/dashboard/interviewer/interviewerCard";
import CreateInterviewerButton from "@/components/dashboard/interviewer/createInterviewerButton";

function Interviewers() {
  const { interviewers, interviewersLoading } = useInterviewers();

  const slideLeft = () => {
    var slider = document.getElementById("slider");
    if (slider) {
      slider.scrollLeft = slider.scrollLeft - 190;
    }
  };

  const slideRight = () => {
    var slider = document.getElementById("slider");
    if (slider) {
      slider.scrollLeft = slider.scrollLeft + 190;
    }
  };

  function InterviewersLoader() {
    return (
      <>
        <div className="flex">
          <div className="h-40 w-36 ml-1 mr-3 flex-none animate-pulse rounded-xl bg-gray-300" />
          <div className="h-40 w-36 ml-1 mr-3 flex-none animate-pulse rounded-xl bg-gray-300" />
          <div className="h-40 w-36 ml-1 mr-3 flex-none animate-pulse rounded-xl bg-gray-300" />
        </div>
      </>
    );
  }

  return (
    <main className="p-8 pt-0 ml-12 mr-auto rounded-md select-none">
      <div className="flex flex-col">

        {/* Section Header */}
        <div className="mt-5">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Interviewers
          </h2>
          <p className="text-sm tracking-tight text-gray-500 font-medium">
            Click a profile to view their expertise and details.
          </p>
        </div>

        {/* Cards Slider */}
        <div className="relative flex items-center mt-4">
          <div
            id="slider"
            className="h-44 pt-2 overflow-x-scroll whitespace-nowrap scroll-smooth scrollbar-hide w-[40rem]"
          >
            {interviewers.length === 0 && <CreateInterviewerButton />}

            {!interviewersLoading ? (
              <>
                {interviewers.map((interviewer) => (
                  <InterviewerCard key={interviewer.id} interviewer={interviewer} />
                ))}
              </>
            ) : (
              <InterviewersLoader />
            )}
          </div>

          {/* Scroll Controls */}
          {interviewers.length > 4 && (
            <div className="flex flex-col justify-center items-center space-y-10 ml-3">
              <ChevronRight
                className="opacity-40 hover:opacity-90 text-indigo-600 hover:text-indigo-700 cursor-pointer transition"
                size={38}
                onClick={slideRight}
              />
              <ChevronLeft
                className="opacity-40 hover:opacity-90 text-indigo-600 hover:text-indigo-700 cursor-pointer transition"
                size={38}
                onClick={slideLeft}
              />
            </div>
          )}
        </div>
      </div>
    </main>

  );
}

export default Interviewers;
