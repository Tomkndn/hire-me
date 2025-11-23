"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import React, { useState, useEffect } from "react";
import { useOrganization } from "@clerk/nextjs";
import { useInterviews } from "@/contexts/interviews.context";
import { Share2, Filter, Pencil, UserIcon, Eye, Palette } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { ResponseService } from "@/services/responses.service";
import { ClientService } from "@/services/clients.service";
import { Interview } from "@/types/interview";
import { Response } from "@/types/response";
import { formatTimestampToDateHHMM } from "@/lib/utils";
import CallInfo from "@/components/call/callInfo";
import SummaryInfo from "@/components/dashboard/interview/summaryInfo";
import { InterviewService } from "@/services/interviews.service";
import EditInterview from "@/components/dashboard/interview/editInterview";
import Modal from "@/components/dashboard/Modal";
import { toast } from "sonner";
import { ChromePicker } from "react-color";
import SharePopup from "@/components/dashboard/interview/sharePopup";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CandidateStatus } from "@/lib/enum";
import LoaderWithText from "@/components/loaders/loader-with-text/loaderWithText";

interface Props {
  params: {
    interviewId: string;
  };
  searchParams: {
    call: string;
    edit: boolean;
  };
}

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

function InterviewHome({ params, searchParams }: Props) {
  const [interview, setInterview] = useState<Interview>();
  const [responses, setResponses] = useState<Response[]>();
  const { getInterviewById } = useInterviews();
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const router = useRouter();
  const [isActive, setIsActive] = useState<boolean>(true);
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [isGeneratingInsights, setIsGeneratingInsights] =
    useState<boolean>(false);
  const [isViewed, setIsViewed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [themeColor, setThemeColor] = useState<string>("#4F46E5");
  const [iconColor, seticonColor] = useState<string>("#4F46E5");
  const { organization } = useOrganization();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const seeInterviewPreviewPage = () => {
    const protocol = base_url?.includes("localhost") ? "http" : "https";
    if (interview?.url) {
      const url = interview?.readable_slug
        ? `${protocol}://${base_url}/call/${interview?.readable_slug}`
        : interview.url.startsWith("http")
          ? interview.url
          : `https://${interview.url}`;
      window.open(url, "_blank");
    } else {
      console.error("Interview URL is null or undefined.");
    }
  };

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await getInterviewById(params.interviewId);
        setInterview(response);
        setIsActive(response.is_active);
        setIsViewed(response.is_viewed);
        setThemeColor(response.theme_color ?? "#4F46E5");
        seticonColor(response.theme_color ?? "#4F46E5");
        setLoading(true);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (!interview || !isGeneratingInsights) {
      fetchInterview();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getInterviewById, params.interviewId, isGeneratingInsights]);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        if (organization?.id) {
          const data = await ClientService.getOrganizationById(organization.id);
          if (data?.plan) {
            setCurrentPlan(data.plan);
          }
        }
      } catch (error) {
        console.error("Error fetching organization data:", error);
      }
    };

    fetchOrganizationData();
  }, [organization]);
  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const response = await ResponseService.getAllResponses(
          params.interviewId,
        );
        if(response) {setResponses(response)};
        setLoading(true);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteResponse = (deletedCallId: string) => {
    if (responses) {
      setResponses(
        responses.filter((response) => response.call_id !== deletedCallId),
      );
      if (searchParams.call === deletedCallId) {
        router.push(`/interviews/${params.interviewId}`);
      }
    }
  };

  const handleResponseClick = async (response: Response) => {
    try {
      await ResponseService.saveResponse({ is_viewed: true }, response.call_id);
      if (responses) {
        const updatedResponses = responses.map((r) =>
          r.call_id === response.call_id ? { ...r, is_viewed: true } : r,
        );
        setResponses(updatedResponses);
      }
      setIsViewed(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggle = async () => {
    try {
      const updatedIsActive = !isActive;
      setIsActive(updatedIsActive);

      await InterviewService.updateInterview(
        { is_active: updatedIsActive },
        params.interviewId,
      );

      toast.success("Interview status updated", {
        description: `The interview is now ${
          updatedIsActive ? "active" : "inactive"
        }.`,
        position: "bottom-right",
        duration: 3000,
      });
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "Failed to update the interview status.",
        duration: 3000,
      });
    }
  };

  const handleThemeColorChange = async (newColor: string) => {
    try {
      await InterviewService.updateInterview(
        { theme_color: newColor },
        params.interviewId,
      );

      toast.success("Theme color updated", {
        position: "bottom-right",
        duration: 3000,
      });
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "Failed to update the theme color.",
        duration: 3000,
      });
    }
  };

  const handleCandidateStatusChange = (callId: string, newStatus: string) => {
    setResponses((prevResponses) => {
      return prevResponses?.map((response) =>
        response.call_id === callId
          ? { ...response, candidate_status: newStatus }
          : response,
      );
    });
  };

  const openSharePopup = () => {
    setIsSharePopupOpen(true);
  };

  const closeSharePopup = () => {
    setIsSharePopupOpen(false);
  };

  const handleColorChange = (color: any) => {
    setThemeColor(color.hex);
  };

  const applyColorChange = () => {
    if (themeColor !== iconColor) {
      seticonColor(themeColor);
      handleThemeColorChange(themeColor);
    }
    setShowColorPicker(false);
  };

  const filterResponses = () => {
    if (!responses) {
      return [];
    }
    if (filterStatus == "ALL") {
      return responses;
    }

    return responses?.filter(
      (response) => response?.candidate_status == filterStatus,
    );
  };

  return (
    <div className="flex flex-col w-full h-full m-2 bg-white">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[80%] w-full">
          <LoaderWithText />
        </div>
      ) : (
          <>
            {/* Top Bar */}
            <div className="flex flex-row p-4 justify-center gap-6 items-center sticky top-2 bg-white/80 backdrop-blur-sm shadow-sm rounded-lg border border-slate-200 mx-2 z-10">

              {/* Interview Title */}
              <div className="font-semibold text-lg">{interview?.name}</div>

              {/* Theme Dot */}
              <div
                className="w-5 h-5 rounded-full border-[1.5px] border-white shadow-sm"
                style={{ backgroundColor: iconColor }}
              />

              {/* Total Responses */}
              <div className="flex flex-row gap-2 items-center text-sm">
                <UserIcon size={16} />
                {String(responses?.length)}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                {/* Share */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="bg-transparent hover:bg-indigo-50 text-indigo-600 shadow-none px-2 h-8"
                        onClick={(e) => { e.stopPropagation(); openSharePopup(); }}
                      >
                        <Share2 size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border shadow-sm text-black">
                      Share
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Preview */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="bg-transparent hover:bg-indigo-50 text-indigo-600 shadow-none px-2 h-8"
                        onClick={(e) => { e.stopPropagation(); seeInterviewPreviewPage(); }}
                      >
                        <Eye size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border shadow-sm text-black">
                      Preview
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Color Picker */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="bg-transparent hover:bg-indigo-50 text-indigo-600 shadow-none px-2 h-8"
                        onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); }}
                      >
                        <Palette size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border shadow-sm text-black">
                      Theme Color
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Edit */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="bg-transparent hover:bg-indigo-50 text-indigo-600 shadow-none px-2 h-8"
                        onClick={(e) => {
                          router.push(`/interviews/${params.interviewId}?edit=true`);
                        }}
                      >
                        <Pencil size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border shadow-sm text-black">
                      Edit
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Toggle Active */}
              <label className="inline-flex items-center cursor-pointer text-sm">
                {currentPlan === "free_trial_over" ? (
                  <>
                    <span className="ms-2 text-gray-600">Inactive</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          ❔
                        </TooltipTrigger>
                        <TooltipContent className="bg-white border shadow-sm text-black">
                          Upgrade your plan to reactivate
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                ) : (
                  <>
                      <span className="ms-1">Active</span>
                      <Switch
                        checked={isActive}
                      className={`ms-2 ${isActive ? "bg-indigo-600" : "bg-gray-300"}`}
                      onCheckedChange={handleToggle}
                    />
                  </>
                )}
              </label>
            </div>

            {/* Layout */}
            <div className="flex flex-row w-full p-2 h-[85%] gap-2">

              {/* Sidebar */}
              <div className="w-[20%] flex flex-col p-2 space-y-3 border border-slate-200 rounded-md bg-white/60 backdrop-blur-sm">

                {/* Filter Dropdown */}
                <Select onValueChange={(v: string) => setFilterStatus(v)}>
                  <SelectTrigger className="w-full bg-slate-100 rounded-lg flex gap-2">
                    <Filter size={18} className="text-slate-400" />
                    <SelectValue placeholder="Filter By" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { label: "No Status", color: "bg-gray-400", value: CandidateStatus.NO_STATUS },
                      { label: "Not Selected", color: "bg-red-500", value: CandidateStatus.NOT_SELECTED },
                      { label: "Potential", color: "bg-yellow-500", value: CandidateStatus.POTENTIAL },
                      { label: "Selected", color: "bg-green-500", value: CandidateStatus.SELECTED },
                      { label: "All", color: "border border-gray-300", value: "ALL" },
                    ].map(({ label, color, value }) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${color}`} />
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sidebar Responses */}
                <ScrollArea className="h-full">
                  {filterResponses().length > 0 ? (
                    filterResponses().map((response) => (
                      <div
                        key={response.id}
                        className={`p-3 text-xs border rounded-md flex gap-2 cursor-pointer
                ${searchParams.call === response.call_id ? "bg-indigo-100 border-indigo-300" : "hover:bg-indigo-50 border-slate-200"}`}
                        onClick={() => {
                          router.push(`/interviews/${params.interviewId}?call=${response.call_id}`);
                          handleResponseClick(response);
                        }}
                      >
                        {/* Status Bar */}
                        <div className={`w-1 rounded-sm ${response.candidate_status === "NOT_SELECTED" ? "bg-red-500" :
                          response.candidate_status === "POTENTIAL" ? "bg-yellow-500" :
                            response.candidate_status === "SELECTED" ? "bg-green-500" : "bg-gray-400"
                          }`} />

                        {/* Info */}
                        <div className="flex justify-between w-full">
                          <div>
                            <p className="font-medium">{response?.name ? `${response?.name}` : "Anonymous"}</p>
                            <p className="text-[10px] text-gray-600">
                              {formatTimestampToDateHHMM(String(response?.created_at))}
                            </p>
                          </div>

                          {/* Score */}
                          {response.analytics?.overallScore !== undefined && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="w-6 h-6 rounded-full border border-indigo-500 text-indigo-600 text-xs font-bold flex items-center justify-center">
                                    {response.analytics.overallScore}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-700 text-white">
                                  Overall Score
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 text-sm py-6">No responses</p>
                  )}
                </ScrollArea>
              </div>

              {/* Right Panel */}
              <div className="w-[80%] rounded-md overflow-hidden">
                {searchParams.call ? (
                  <CallInfo
                    call_id={searchParams.call}
                    onDeleteResponse={handleDeleteResponse}
                    onCandidateStatusChange={handleCandidateStatusChange}
                  />
                ) : searchParams.edit ? (
                  <EditInterview interview={interview} />
                ) : (
                    <SummaryInfo responses={responses ?? []} interview={interview} />
                )}
              </div>
            </div>
          </>

      )}
      <Modal
        open={showColorPicker}
        closeOnOutsideClick={false}
        onClose={applyColorChange}
      >
        <div className="w-[250px] p-3">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Choose a Theme Color
          </h3>
          <ChromePicker
            disableAlpha={true}
            color={themeColor}
            styles={{
              default: {
                picker: { width: "100%" },
              },
            }}
            onChange={handleColorChange}
          />
        </div>
      </Modal>
      {isSharePopupOpen && (
        <SharePopup
          open={isSharePopupOpen}
          shareContent={
            interview?.readable_slug
              ? `${base_url}/call/${interview?.readable_slug}`
              : (interview?.url as string)
          }
          onClose={closeSharePopup}
        />
      )}
    </div>
  );
}

export default InterviewHome;
