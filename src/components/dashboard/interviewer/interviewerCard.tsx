import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Modal from "@/components/dashboard/Modal";
import { Interviewer } from "@/types/interviewer";
import InterviewerDetailsModal from "@/components/dashboard/interviewer/interviewerDetailsModal";

interface Props {
  interviewer: Interviewer;
}

const interviewerCard = ({ interviewer }: Props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className="p-0 inline-block cursor-pointer h-40 w-36 ml-1 mr-3 rounded-xl shrink-0 overflow-hidden shadow-md
             bg-white/70 backdrop-blur-sm border border-indigo-100 hover:shadow-lg hover:shadow-indigo-200/70
             hover:scale-105 transition-all duration-300 ease-in-out"
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-0">

          {/* Profile Image */}
          <div className="w-full h-28 overflow-hidden relative">
            <Image
              src={interviewer.image}
              alt="Picture of the interviewer"
              width={200}
              height={40}
              className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
            />

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/5"/>
          </div>

          {/* Name */}
          <CardTitle className="mt-2 text-sm font-semibold text-center text-gray-800 truncate px-2">
            {interviewer.name}
          </CardTitle>
        </CardContent>
      </Card>

      <Modal
        open={open}
        closeOnOutsideClick={true}
        onClose={() => {
          setOpen(false);
        }}
      >
        <InterviewerDetailsModal interviewer={interviewer} />
      </Modal>
    </>
  );
};

export default interviewerCard;
