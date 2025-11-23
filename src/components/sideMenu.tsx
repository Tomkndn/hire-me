"use client";

import React from "react";
import { PlayCircleIcon, SpeechIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

function SideMenu() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="z-[10] bg-white/70 backdrop-blur-md border-r border-indigo-200 shadow-sm p-6 w-[220px] fixed top-[64px] left-0 h-full">
  <div className="flex flex-col gap-2 mt-4">

    {/* Interviews */}
    <div
      className={`
        flex flex-row items-center p-3 rounded-lg cursor-pointer transition-all duration-200 
        ${
          pathname.endsWith("/dashboard") || pathname.includes("/interviews")
            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200"
            : "text-gray-700 hover:bg-indigo-50"
        }
      `}
      onClick={() => router.push("/dashboard")}
    >
      <PlayCircleIcon
        className={`
          mr-2 h-5 w-5
          ${
            pathname.endsWith("/dashboard") || pathname.includes("/interviews")
              ? "text-white"
              : "text-indigo-600"
          }
        `}
      />
      <p
        className={`
          font-medium text-sm
          ${
            pathname.endsWith("/dashboard") || pathname.includes("/interviews")
              ? "text-white"
              : "text-gray-800"
          }
        `}
      >
        Interviews
      </p>
    </div>

    {/* Interviewers */}
    <div
      className={`
        flex flex-row items-center p-3 rounded-lg cursor-pointer transition-all duration-200 
        ${
          pathname.endsWith("/interviewers")
            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200"
            : "text-gray-700 hover:bg-indigo-50"
        }
      `}
      onClick={() => router.push("/dashboard/interviewers")}
    >
      <SpeechIcon
        className={`
          mr-2 h-5 w-5
          ${
            pathname.endsWith("/interviewers")
              ? "text-white"
              : "text-indigo-600"
          }
        `}
      />
      <p
        className={`
          font-medium text-sm
          ${
            pathname.endsWith("/interviewers")
              ? "text-white"
              : "text-gray-800"
          }
        `}
      >
        Interviewers
      </p>
    </div>

  </div>
</div>

  );
}

export default SideMenu;
