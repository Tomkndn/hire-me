"use client";

import {
  ArrowUpRightSquareIcon,
  AlarmClockIcon,
  XCircleIcon,
  CheckCircleIcon,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useResponses } from "@/contexts/responses.context";
import Image from "next/image";
import axios from "axios";
import { RetellWebClient } from "retell-client-js-sdk";
import MiniLoader from "../loaders/mini-loader/miniLoader";
import { toast } from "sonner";
import { isLightColor, testEmail } from "@/lib/utils";
import { ResponseService } from "@/services/responses.service";
import { Interview } from "@/types/interview";
import { FeedbackData } from "@/types/response";
import { FeedbackService } from "@/services/feedback.service";
import { FeedbackForm } from "@/components/call/feedbackForm";
import {
  TabSwitchWarning,
  useTabSwitchPrevention,
} from "./tabSwitchPrevention";
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
import { InterviewerService } from "@/services/interviewers.service";

const webClient = new RetellWebClient();

type InterviewProps = {
  interview: Interview;
};

type registerCallResponseType = {
  data: {
    registerCallResponse: {
      call_id: string;
      access_token: string;
    };
  };
};

type transcriptType = {
  role: string;
  content: string;
};

function Call({ interview }: InterviewProps) {
  const { createResponse } = useResponses();
  const [lastInterviewerResponse, setLastInterviewerResponse] =
    useState<string>("");
  const [lastUserResponse, setLastUserResponse] = useState<string>("");
  const [activeTurn, setActiveTurn] = useState<string>("");
  const [Loading, setLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [isOldUser, setIsOldUser] = useState<boolean>(false);
  const [callId, setCallId] = useState<string>("");
  const { tabSwitchCount } = useTabSwitchPrevention();
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [interviewerImg, setInterviewerImg] = useState("");
  const [interviewTimeDuration, setInterviewTimeDuration] =
    useState<string>("1");
  const [time, setTime] = useState(0);
  const [currentTimeDuration, setCurrentTimeDuration] = useState<string>("0");

  const lastUserResponseRef = useRef<HTMLDivElement | null>(null);

  const handleFeedbackSubmit = async (
    formData: Omit<FeedbackData, "interview_id">,
  ) => {
    try {
      const result = await FeedbackService.submitFeedback({
        ...formData,
        interview_id: interview.id,
      });

      if (result) {
        toast.success("Thank you for your feedback!");
        setIsFeedbackSubmitted(true);
        setIsDialogOpen(false);
      } else {
        toast.error("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  useEffect(() => {
    if (lastUserResponseRef.current) {
      const { current } = lastUserResponseRef;
      current.scrollTop = current.scrollHeight;
    }
  }, [lastUserResponse]);

  useEffect(() => {
    let intervalId: any;
    if (isCalling) {
      // setting time from 0 to 1 every 10 milisecond using javascript setInterval method
      intervalId = setInterval(() => setTime(time + 1), 10);
    }
    setCurrentTimeDuration(String(Math.floor(time / 100)));
    if (Number(currentTimeDuration) == Number(interviewTimeDuration) * 60) {
      webClient.stopCall();
      setIsEnded(true);
    }

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCalling, time, currentTimeDuration]);

  useEffect(() => {
    if (testEmail(email)) {
      setIsValidEmail(true);
    }
  }, [email]);

  useEffect(() => {
    webClient.on("call_started", () => {
      console.log("Call started");
      setIsCalling(true);
    });

    webClient.on("call_ended", () => {
      console.log("Call ended");
      setIsCalling(false);
      setIsEnded(true);
    });

    webClient.on("agent_start_talking", () => {
      setActiveTurn("agent");
    });

    webClient.on("agent_stop_talking", () => {
      // Optional: Add any logic when agent stops talking
      setActiveTurn("user");
    });

    webClient.on("error", (error) => {
      console.error("An error occurred:", error);
      webClient.stopCall();
      setIsEnded(true);
      setIsCalling(false);
    });

    webClient.on("update", (update) => {
      if (update.transcript) {
        const transcripts: transcriptType[] = update.transcript;
        const roleContents: { [key: string]: string } = {};

        transcripts.forEach((transcript) => {
          roleContents[transcript?.role] = transcript?.content;
        });

        setLastInterviewerResponse(roleContents["agent"]);
        setLastUserResponse(roleContents["user"]);
      }
      //TODO: highlight the newly uttered word in the UI
    });

    return () => {
      // Clean up event listeners
      webClient.removeAllListeners();
    };
  }, []);

  const onEndCallClick = async () => {
    if (isStarted) {
      setLoading(true);
      webClient.stopCall();
      setIsEnded(true);
      setLoading(false);
    } else {
      setIsEnded(true);
    }
  };

  const startConversation = async () => {
    const data = {
      mins: interview?.time_duration,
      objective: interview?.objective,
      questions: interview?.questions.map((q) => q.question).join(", "),
      name: name || "not provided",
    };
    setLoading(true);

    const oldUserEmails: string[] = (
      await ResponseService.getAllEmails(interview.id)
    ).map((item) => item.email);
    const OldUser =
      oldUserEmails.includes(email) ||
      (interview?.respondents && !interview?.respondents.includes(email));

    if (OldUser) {
      setIsOldUser(true);
    } else {
      const registerCallResponse: registerCallResponseType = await axios.post(
        "/api/register-call",
        { dynamic_data: data, interviewer_id: interview?.interviewer_id },
      );
      if (registerCallResponse.data.registerCallResponse.access_token) {
        await webClient
          .startCall({
            accessToken:
              registerCallResponse.data.registerCallResponse.access_token,
          })
          .catch(console.error);
        setIsCalling(true);
        setIsStarted(true);

        setCallId(registerCallResponse?.data?.registerCallResponse?.call_id);

        const response = await createResponse({
          interview_id: interview.id,
          call_id: registerCallResponse.data.registerCallResponse.call_id,
          email: email,
          name: name,
        });
      } else {
        console.log("Failed to register call");
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (interview?.time_duration) {
      setInterviewTimeDuration(interview?.time_duration);
    }
  }, [interview]);

  useEffect(() => {
    const fetchInterviewer = async () => {
      const interviewer = await InterviewerService.getInterviewer(
        interview.interviewer_id,
      );
      setInterviewerImg(interviewer.image);
    };
    fetchInterviewer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interview.interviewer_id]);

  useEffect(() => {
    if (isEnded) {
      const updateInterview = async () => {
        await ResponseService.saveResponse(
          { is_ended: true, tab_switch_count: tabSwitchCount },
          callId,
        );
      };

      updateInterview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnded]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {isStarted && <TabSwitchWarning />}

      <div className="bg-white rounded-md md:w-[80%] w-[90%] flex flex-col">
        <Card className="h-[88vh] flex flex-col rounded-lg border-2 border-b-4 border-r-4 border-black text-xl font-bold transition-all dark:border-white">

          {/* PROGRESS BAR */}
          <div className="p-4 pb-1">
            <div className="h-[15px] rounded-lg border border-black">
              <div
                className="bg-indigo-600 h-[15px] rounded-lg"
                style={{
                  width: isEnded
                    ? "100%"
                    : `${(Number(currentTimeDuration) / (Number(interviewTimeDuration) * 60)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* HEADER */}
          <CardHeader className="items-center p-1">
            {!isEnded && (
              <>
                <CardTitle className="text-lg md:text-xl font-bold mb-1">
                  {interview?.name}
                </CardTitle>

                <div className="flex flex-row items-center mt-1">
                  <AlarmClockIcon
                    className="h-4 w-4 mr-2"
                    style={{ color: interview.theme_color }}
                  />
                  <div className="text-sm font-normal">
                    Expected duration:{" "}
                    <span className="font-bold" style={{ color: interview.theme_color }}>
                      {interviewTimeDuration} mins
                    </span>{" "}
                    or less
                  </div>
                </div>
              </>
            )}
          </CardHeader>

          {/* CONTENT AREA - SCROLLABLE WHEN NEEDED */}
          <div className="flex-1 overflow-y-auto px-2 pb-20">

            {/* LANDING FORM */}
            {!isStarted && !isEnded && !isOldUser && (
              <div className="w-full max-w-[420px] mx-auto mt-4 border border-indigo-200 rounded-md p-4 bg-slate-50">
                {/* Logo */}
                {interview?.logo_url && (
                  <div className="flex justify-center mb-3">
                    <Image
                      src={interview?.logo_url}
                      alt="Logo"
                      width={100}
                      height={100}
                      className="h-10 w-auto"
                    />
                  </div>
                )}

                {/* Description */}
                <div className="font-normal text-sm mb-4 whitespace-pre-line">
                  {interview?.description}
                  <p className="font-bold text-sm mt-2">
                    Ensure your volume is up. Grant microphone access. Avoid noise.
                    Note: Tab switching will be recorded.
                  </p>
                </div>

                {/* EMAIL + NAME */}
                {!interview?.is_anonymous && (
                  <div className="flex flex-col gap-3">
                    <input
                      value={email}
                      className="py-2 border-2 rounded-md w-full px-2 text-sm"
                      placeholder="Enter your email address"
                      onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                      value={name}
                      className="py-2 border-2 rounded-md w-full px-2 text-sm"
                      placeholder="Enter your first name"
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}

                {/* BUTTONS */}
                <div className="flex justify-center mt-6">
                  <Button
                    className="min-w-24 h-10 rounded-lg"
                    style={{
                      backgroundColor: interview.theme_color ?? "#4F46E5",
                      color: isLightColor(interview.theme_color ?? "#4F46E5")
                        ? "black"
                        : "white",
                    }}
                    disabled={
                      Loading ||
                      (!interview?.is_anonymous && (!isValidEmail || !name))
                    }
                    onClick={startConversation}
                  >
                    {!Loading ? "Start Interview" : <MiniLoader />}
                  </Button>

                  {/* Exit */}
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <Button
                        className="bg-white border ml-2 text-black min-w-20 h-10 rounded-lg"
                        style={{ borderColor: interview.theme_color }}
                        disabled={Loading}
                      >
                        Exit
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-indigo-600 hover:bg-indigo-800"
                          onClick={onEndCallClick}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}

            {/* INTERVIEW ACTIVE */}
            {isStarted && !isEnded && !isOldUser && (
              <div className="flex flex-row gap-2 p-2">

                {/* INTERVIEWER */}
                <div className="w-1/2 border-r-2 pr-2">
                  <div className="min-h-[200px] text-[22px] md:text-[26px] px-4">
                    {lastInterviewerResponse}
                  </div>

                  <div className="flex flex-col items-center mt-4">
                    <Image
                      src={interviewerImg}
                      alt="Interviewer"
                      width={120}
                      height={120}
                      className={`rounded-full object-cover ${activeTurn === "agent" &&
                        `border-4 border-[${interview.theme_color}]`
                        }`}
                    />
                    <div className="font-semibold mt-1">Interviewer</div>
                  </div>
                </div>

                {/* USER */}
                <div className="w-1/2 pl-2">
                  <div
                    ref={lastUserResponseRef}
                    className="min-h-[200px] text-[22px] md:text-[26px] px-4 overflow-y-auto max-h-[260px]"
                  >
                    {lastUserResponse}
                  </div>

                  <div className="flex flex-col items-center mt-4">
                    <Image
                      src="/user-icon.png"
                      alt="You"
                      width={120}
                      height={120}
                      className={`rounded-full object-cover ${activeTurn === "user" &&
                        `border-4 border-[${interview.theme_color}]`
                        }`}
                    />
                    <div className="font-semibold mt-1">You</div>
                  </div>
                </div>
              </div>
            )}

            {/* END MESSAGE */}
            {isEnded && !isOldUser && (
              <div className="w-full max-w-[420px] mx-auto mt-10 border border-indigo-200 rounded-md p-4 bg-slate-50 text-center">
                <CheckCircleIcon className="h-10 w-10 mx-auto text-indigo-500" />
                <p className="text-lg font-semibold mt-4">
                  Thank you for taking the interview!
                </p>
                <p className="mt-1">You can close this tab now.</p>

                {!isFeedbackSubmitted && (
                  <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <AlertDialogTrigger className="w-full">
                      <Button className="bg-indigo-600 text-white h-10 mt-4">
                        Provide Feedback
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <FeedbackForm email={email} onSubmit={handleFeedbackSubmit} />
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}

            {/* ALREADY ATTEMPTED */}
            {isOldUser && (
              <div className="w-full max-w-[420px] mx-auto mt-10 border border-indigo-200 rounded-md p-4 bg-slate-50 text-center">
                <CheckCircleIcon className="h-10 w-10 mx-auto text-indigo-500" />
                <p className="text-lg font-semibold mt-4">
                  You have already responded or are not eligible.
                </p>
                <p>You may close the tab now.</p>
              </div>
            )}

          </div>

          {/* FIXED BOTTOM BUTTON — NEVER HIDDEN */}
          {isStarted && !isEnded && !isOldUser && (
            <div className="sticky bottom-0 bg-white border-t py-3 px-4">
              <AlertDialog>
                <AlertDialogTrigger className="w-full">
                  <Button className="w-full bg-white text-black border border-indigo-600 h-10 flex justify-center">
                    End Interview
                    <XCircleIcon className="h-5 w-5 ml-2" />
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>End Interview?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-indigo-600 hover:bg-indigo-800"
                      onClick={onEndCallClick}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </Card>

        {/* FOOTER */}
        <a
          className="flex flex-row justify-center items-center mt-3"
          href="https://github.com/tomkndn"
          target="_blank"
        >
          <div className="text-center text-md font-semibold mr-2">
            Powered by <span className="font-bold">Hire<span className="text-indigo-600">Me</span></span>
          </div>
          <ArrowUpRightSquareIcon className="h-6 w-6 text-indigo-500" />
        </a>
      </div>
    </div>

  );
}

export default Call;
