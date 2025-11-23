import Image from "next/image";
import { CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import ReactAudioPlayer from "react-audio-player";
import { Interviewer } from "@/types/interviewer";

interface Props {
  interviewer: Interviewer | undefined;
}

function InterviewerDetailsModal({ interviewer }: Props) {
  return (
    <div className="text-center w-[40rem] mx-auto">
      {/* Name */}
      <CardTitle className="text-3xl font-bold text-gray-800 tracking-tight">
        {interviewer?.name}
      </CardTitle>

      <div className="mt-4 p-4 flex flex-col justify-center items-center bg-white/60 backdrop-blur-sm 
                  border border-indigo-100 rounded-xl shadow-md">
        {/* Image + Description */}
        <div className="flex flex-row justify-center space-x-10 items-start">

          {/* Profile Image */}
          <div className="relative flex items-center justify-center border-4 border-indigo-300 
                      overflow-hidden rounded-xl h-48 w-44 shadow-lg hover:shadow-indigo-300/40 
                      hover:scale-105 transition-transform duration-300 ease-in-out">
            <Image
              src={interviewer?.image || ""}
              alt="Picture of the interviewer"
              width={180}
              height={30}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Description + Audio */}
          <div className="flex flex-col gap-3 text-left">
            <p className="text-sm leading-relaxed whitespace-normal w-[25rem] text-justify text-gray-700">
              {interviewer?.description}
            </p>

            {interviewer?.audio && (
              <div className="mt-2 w-full p-2 rounded-md bg-white/40 border border-indigo-200 shadow-sm">
                <ReactAudioPlayer src={`/audio/${interviewer.audio}`} controls />
              </div>
            )}
          </div>

        </div>

        {/* Settings */}
        <h3 className="text-lg font-semibold mt-6 text-gray-800">
          Interviewer Settings
        </h3>

        <div className="flex flex-row space-x-16 justify-center items-start mt-4">

          {/* Col 1 */}
          <div className="flex flex-col gap-3">
            {/* Empathy */}
            <div className="flex items-center justify-between w-60">
              <span className="font-medium text-sm w-24 text-left text-gray-700">Empathy</span>
              <div className="flex items-center gap-3 w-36">
                <Slider
                  value={[(interviewer?.empathy || 10) / 10]}
                  max={1}
                  step={0.1}
                  className="accent-indigo-600"
                />
                <span className="text-xs">{(interviewer?.empathy || 10) / 10}</span>
              </div>
            </div>

            {/* Rapport */}
            <div className="flex items-center justify-between w-60">
              <span className="font-medium text-sm w-24 text-left text-gray-700">Rapport</span>
              <div className="flex items-center gap-3 w-36">
                <Slider
                  value={[(interviewer?.rapport || 10) / 10]}
                  max={1}
                  step={0.1}
                />
                <span className="text-xs">{(interviewer?.rapport || 10) / 10}</span>
              </div>
            </div>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-3">
            {/* Exploration */}
            <div className="flex items-center justify-between w-60">
              <span className="font-medium text-sm w-24 text-left text-gray-700">Exploration</span>
              <div className="flex items-center gap-3 w-36">
                <Slider
                  value={[(interviewer?.exploration || 10) / 10]}
                  max={1}
                  step={0.1}
                />
                <span className="text-xs">{(interviewer?.exploration || 10) / 10}</span>
              </div>
            </div>

            {/* Speed */}
            <div className="flex items-center justify-between w-60">
              <span className="font-medium text-sm w-24 text-left text-gray-700">Speed</span>
              <div className="flex items-center gap-3 w-36">
                <Slider
                  value={[(interviewer?.speed || 10) / 10]}
                  max={1}
                  step={0.1}
                />
                <span className="text-xs">{(interviewer?.speed || 10) / 10}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

  );
}

export default InterviewerDetailsModal;
