"use client";

import { Interview } from "@/types/interview";
import { Interviewer } from "@/types/interviewer";
import { Response } from "@/types/response";
import React, { useEffect, useState } from "react";
import { UserCircleIcon, SmileIcon, Info } from "lucide-react";
import { useInterviewers } from "@/contexts/interviewers.context";
import { PieChart } from "@mui/x-charts/PieChart";
import { CandidateStatus } from "@/lib/enum";
import { convertSecondstoMMSS } from "@/lib/utils";
import Image from "next/image";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import DataTable, {
  TableData,
} from "@/components/dashboard/interview/dataTable";
import { ScrollArea } from "@/components/ui/scroll-area";

type SummaryProps = {
  responses: Response[];
  interview: Interview | undefined;
};

function InfoTooltip({ content }: { content: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Info
            className="h-2 w-2 text-[#4F46E5] inline-block ml-0 align-super font-bold"
            strokeWidth={2.5}
          />
        </TooltipTrigger>
        <TooltipContent className="bg-gray-500 text-white font-normal">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SummaryInfo({ responses, interview }: SummaryProps) {
  const { interviewers } = useInterviewers();
  const [interviewer, setInterviewer] = useState<Interviewer>();
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [completedInterviews, setCompletedInterviews] = useState<number>(0);
  const [sentimentCount, setSentimentCount] = useState({
    positive: 0,
    negative: 0,
    neutral: 0,
  });
  const [callCompletion, setCallCompletion] = useState({
    complete: 0,
    incomplete: 0,
    partial: 0,
  });

  const totalResponses = responses.length;

  const [candidateStatusCount, setCandidateStatusCount] = useState({
    [CandidateStatus.NO_STATUS]: 0,
    [CandidateStatus.NOT_SELECTED]: 0,
    [CandidateStatus.POTENTIAL]: 0,
    [CandidateStatus.SELECTED]: 0,
  });

  const [tableData, setTableData] = useState<TableData[]>([]);

  const prepareTableData = (responses: Response[]): TableData[] => {
    return responses.map((response) => ({
      call_id: response.call_id,
      name: response.name || "Anonymous",
      overallScore: response.analytics?.overallScore || 0,
      communicationScore: response.analytics?.communication?.score || 0,
      callSummary:
        response.analytics?.softSkillSummary ||
        response.details?.call_analysis?.call_summary ||
        "No summary available",
    }));
  };

  useEffect(() => {
    if (!interviewers || !interview) {
      return;
    }
    const interviewer = interviewers.find(
      (interviewer) => interviewer.id === interview.interviewer_id,
    );
    setInterviewer(interviewer);
  }, [interviewers, interview]);

  useEffect(() => {
    if (!responses) {
      return;
    }

    const sentimentCounter = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    const callCompletionCounter = {
      complete: 0,
      incomplete: 0,
      partial: 0,
    };

    let totalDuration = 0;
    let completedCount = 0;

    const statusCounter = {
      [CandidateStatus.NO_STATUS]: 0,
      [CandidateStatus.NOT_SELECTED]: 0,
      [CandidateStatus.POTENTIAL]: 0,
      [CandidateStatus.SELECTED]: 0,
    };

    responses.forEach((response) => {
      const sentiment = response.details?.call_analysis?.user_sentiment;
      if (sentiment === "Positive") {
        sentimentCounter.positive += 1;
      } else if (sentiment === "Negative") {
        sentimentCounter.negative += 1;
      } else if (sentiment === "Neutral") {
        sentimentCounter.neutral += 1;
      }

      const callCompletion =
        response.details?.call_analysis?.call_completion_rating;
      if (callCompletion === "Complete") {
        callCompletionCounter.complete += 1;
      } else if (callCompletion === "Incomplete") {
        callCompletionCounter.incomplete += 1;
      } else if (callCompletion === "Partial") {
        callCompletionCounter.partial += 1;
      }

      const agentTaskCompletion =
        response.details?.call_analysis?.agent_task_completion_rating;
      if (
        agentTaskCompletion === "Complete" ||
        agentTaskCompletion === "Partial"
      ) {
        completedCount += 1;
      }

      totalDuration += response.duration;
      if (
        Object.values(CandidateStatus).includes(
          response.candidate_status as CandidateStatus,
        )
      ) {
        statusCounter[response.candidate_status as CandidateStatus]++;
      }
    });

    setSentimentCount(sentimentCounter);
    setCallCompletion(callCompletionCounter);
    setTotalDuration(totalDuration);
    setCompletedInterviews(completedCount);
    setCandidateStatusCount(statusCounter);

    const preparedData = prepareTableData(responses);
    setTableData(preparedData);
  }, [responses]);

  return (
    <div className="h-screen z-[10] mx-2">
      {responses.length > 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 min-h-[120px] p-4">

          {/* Header */}
          <div className="flex flex-row justify-between items-center mb-2 px-1">
            <p className="font-semibold text-lg text-slate-800">Overall Analysis</p>
            <p className="text-sm text-slate-600">
              Interviewer used:{" "}
              <span className="font-semibold text-slate-800">{interviewer?.name}</span>
            </p>
          </div>

          {/* Description */}
          <p className="my-3 ml-1 text-sm text-slate-600">
            Interview Description:{" "}
            <span className="font-medium text-slate-800">{interview?.description}</span>
          </p>

          {/* Table Section */}
          <div className="flex flex-col gap-1 my-2 mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
            <ScrollArea className="h-[250px]">
              <DataTable data={tableData} interviewId={interview?.id || ""} />
            </ScrollArea>
          </div>

          {/* Stats + Charts Section */}
          <div className="flex flex-row gap-3 mt-3 justify-center flex-wrap">

            {/* Column - Duration + Completion Rate */}
            <div className="flex flex-col gap-3">

              {/* Avg Duration */}
              <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-200 max-w-[360px] flex flex-col items-center">
                <div className="flex gap-1 items-center font-semibold text-[15px] text-slate-800 mb-1">
                  Average Duration
                  <InfoTooltip content="Average time users took to complete an interview" />
                </div>
                <p className="text-2xl font-semibold text-indigo-600 px-3 py-1 bg-indigo-100 rounded-md">
                  {convertSecondstoMMSS(totalDuration / responses.length)}
                </p>
              </div>

              {/* Completion Rate */}
              <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-200 max-w-[360px] flex flex-col items-center">
                <div className="flex gap-1 items-center font-semibold text-[15px] text-slate-800 mb-1 text-center">
                  Interview Completion Rate
                  <InfoTooltip content="Percentage of interviews completed successfully" />
                </div>
                <p className="text-2xl font-semibold text-indigo-600 px-3 py-1 bg-indigo-100 rounded-md">
                  {Math.round((completedInterviews / responses.length) * 10000) / 100}%
                </p>
              </div>
            </div>

            {/* Chart - Sentiment */}
            <div className="p-5 rounded-2xl bg-white shadow-sm border border-slate-200 max-w-[360px]">
              <div className="flex gap-2 font-bold text-[15px] text-slate-800 mb-2 mx-auto">
                <SmileIcon />
                Candidate Sentiment
                <InfoTooltip content="Distribution of user sentiments during interviews" />
              </div>
              <PieChart
                sx={{
                  "& .MuiChartsLegend-series text": { fontSize: "0.8rem !important" },
                }}
                series={[
                  {
                    data: [
                      { id: 0, value: sentimentCount.positive, label: `Positive (${sentimentCount.positive})`, color: "#22c55e" },
                      { id: 1, value: sentimentCount.neutral, label: `Neutral (${sentimentCount.neutral})`, color: "#eab308" },
                      { id: 2, value: sentimentCount.negative, label: `Negative (${sentimentCount.negative})`, color: "#eb4444" },
                    ],
                    highlightScope: { faded: "global", highlighted: "item" },
                    faded: { innerRadius: 10, additionalRadius: -10, color: "gray" },
                  },
                ]}
                width={360}
                height={120}
              />
            </div>

            {/* Chart - Candidate Status */}
            <div className="p-5 rounded-2xl bg-white shadow-sm border border-slate-200 max-w-[360px]">
              <div className="flex gap-2 font-bold text-[15px] text-slate-800 mb-1 mx-auto">
                <UserCircleIcon />
                Candidate Status
                <InfoTooltip content="Breakdown of the candidate selection status" />
              </div>
              <div className="text-sm text-center text-slate-600 mb-1">
                Total Responses: {totalResponses}
              </div>
              <PieChart
                sx={{
                  "& .MuiChartsLegend-series text": { fontSize: "0.8rem !important" },
                }}
                series={[
                  {
                    data: [
                      {
                        id: 0,
                        value: candidateStatusCount[CandidateStatus.SELECTED],
                        label: `Selected (${candidateStatusCount[CandidateStatus.SELECTED]})`,
                        color: "#22c55e",
                      },
                      {
                        id: 1,
                        value: candidateStatusCount[CandidateStatus.POTENTIAL],
                        label: `Potential (${candidateStatusCount[CandidateStatus.POTENTIAL]})`,
                        color: "#eab308",
                      },
                      {
                        id: 2,
                        value: candidateStatusCount[CandidateStatus.NOT_SELECTED],
                        label: `Not Selected (${candidateStatusCount[CandidateStatus.NOT_SELECTED]})`,
                        color: "#eb4444",
                      },
                      {
                        id: 3,
                        value: candidateStatusCount[CandidateStatus.NO_STATUS],
                        label: `No Status (${candidateStatusCount[CandidateStatus.NO_STATUS]})`,
                        color: "#9ca3af",
                      },
                    ],
                    highlightScope: { faded: "global", highlighted: "item" },
                    faded: { innerRadius: 10, additionalRadius: -10, color: "gray" },
                  },
                ]}
                width={360}
                height={120}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-[85%] h-[60%] flex flex-col items-center justify-center">
          <Image src="/no-responses.png" alt="logo" width={270} height={270} />
          <p className="text-center text-sm mt-1 text-slate-500">
            Please share with your intended respondents
          </p>
        </div>
      )}
    </div>

  );
}

export default SummaryInfo;
