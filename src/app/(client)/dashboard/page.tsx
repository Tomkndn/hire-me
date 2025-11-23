"use client";

import React, { useState, useEffect } from "react";
import { useOrganization } from "@clerk/nextjs";
import InterviewCard from "@/components/dashboard/interview/interviewCard";
import CreateInterviewCard from "@/components/dashboard/interview/createInterviewCard";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { InterviewService } from "@/services/interviews.service";
import { ClientService } from "@/services/clients.service";
import { ResponseService } from "@/services/responses.service";
import { useInterviews } from "@/contexts/interviews.context";
import Modal from "@/components/dashboard/Modal";
import { Gem, Plus } from "lucide-react";
import Image from "next/image";

function Interviews() {
  const { interviews, interviewsLoading } = useInterviews();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [allowedResponsesCount, setAllowedResponsesCount] =
    useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  function InterviewsLoader() {
    return (
      <>
        <div className="flex flex-row">
          <div className="h-60 w-56 ml-1 mr-3 mt-3 flex-none animate-pulse rounded-xl bg-gray-300" />
          <div className="h-60 w-56 ml-1 mr-3  mt-3 flex-none animate-pulse rounded-xl bg-gray-300" />
          <div className="h-60 w-56 ml-1 mr-3 mt-3 flex-none animate-pulse rounded-xl bg-gray-300" />
        </div>
      </>
    );
  }

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        if (organization?.id) {
          const data = await ClientService.getOrganizationById(organization.id);
          if (data?.plan) {
            setCurrentPlan(data.plan);
            if (data.plan === "free_trial_over") {
              setIsModalOpen(true);
            }
          }
          if (data?.allowed_responses_count) {
            setAllowedResponsesCount(data.allowed_responses_count);
          }
        }
      } catch (error) {
        console.error("Error fetching organization data:", error);
      }
    };

    fetchOrganizationData();
  }, [organization]);

  useEffect(() => {
    const fetchResponsesCount = async () => {
      if (!organization || currentPlan !== "free") {
        return;
      }

      setLoading(true);
      try {
        const totalResponses =
          await ResponseService.getResponseCountByOrganizationId(
            organization.id,
          );
        const hasExceededLimit = totalResponses >= allowedResponsesCount;
        if (hasExceededLimit) {
          setCurrentPlan("free_trial_over");
          await InterviewService.deactivateInterviewsByOrgId(organization.id);
          await ClientService.updateOrganization(
            { plan: "free_trial_over" },
            organization.id,
          );
        }
      } catch (error) {
        console.error("Error fetching responses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponsesCount();
  }, [organization, currentPlan, allowedResponsesCount]);

  return (
    <main className="px-10 pt-0 ml-12 mr-auto">
      <div className="flex flex-col">
        <h2 className="mt-8 text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          My Interviews
          <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-sm">
            Active
          </span>
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Start getting responses now!
        </p>

        <div className="relative flex flex-wrap gap-5 mt-2">
          {currentPlan == "free_trial_over" ? (


            <Card className="group rounded-xl bg-white/70 backdrop-blur-md border border-indigo-200 shadow-md hover:shadow-indigo-200/60 hover:shadow-xl w-60 h-60 flex items-center justify-center hover:scale-[1.05] transition duration-300 ease-in-out cursor-pointer">
              <CardContent className="flex flex-col items-center text-center p-4">

                {/* Icon */}
                <div className="p-4 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-300 group-hover:shadow-lg">
                  <Plus size={38} className="opacity-95" />
                </div>

                {/* Message */}
                <CardTitle className="mt-4 text-sm font-semibold text-gray-800 tracking-tight px-2">
                  Create more interviews by upgrading your plan
                </CardTitle>

                {/* Badge */}
                <span className="mt-3 text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium shadow-sm">
                  Upgrade Required
                </span>
              </CardContent>
            </Card>

          ) : (
            <CreateInterviewCard />
          )}

          {interviewsLoading || loading ? (
            <InterviewsLoader />
          ) : (
            <>
              {isModalOpen && (
                <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                  <div className="flex flex-col space-y-6 p-3">
                    <div className="flex justify-center">
                      <div className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md">
                        <Gem size={40} />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-center text-gray-800">
                      Upgrade to Pro
                    </h3>

                    <p className="text-sm text-center text-gray-600 max-w-sm mx-auto">
                      You’ve reached the free trial limit. Upgrade to continue using all powerful features.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex justify-center items-center">
                        <Image
                          src={"/premium-plan-icon.png"}
                          alt="Graphic"
                          width={260}
                          height={280}
                          className="rounded-lg shadow-md"
                        />
                      </div>

                      <div className="grid grid-rows-2 gap-4">
                        <div className="p-4 border rounded-lg bg-white/60 backdrop-blur-sm shadow-sm border-indigo-200">
                          <h4 className="text-lg font-semibold text-gray-700">Free Plan</h4>
                          <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
                            <li>10 Responses</li>
                            <li>Basic Support</li>
                            <li>Limited Features</li>
                          </ul>
                        </div>

                        <div className="p-4 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md">
                          <h4 className="text-lg font-semibold">Pro Plan</h4>
                          <ul className="list-disc pl-5 mt-2 text-sm">
                            <li>Flexible Pay-Per-Response</li>
                            <li>Priority Support</li>
                            <li>All Features Unlocked</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-center text-gray-700">
                      Contact{" "}
                      <span className="font-semibold text-indigo-600">
                        tomkndn@example.com
                      </span>{" "}
                      to upgrade your plan.
                    </p>
                  </div>
                </Modal>
              )}

              {interviews.map((item) => (
                <InterviewCard
                  id={item.id}
                  interviewerId={item.interviewer_id}
                  key={item.id}
                  name={item.name}
                  url={item.url ?? ""}
                  readableSlug={item.readable_slug}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </main>


  );
}

export default Interviews;
