"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import CreateInterviewModal from "@/components/dashboard/interview/createInterviewModal";
import Modal from "@/components/dashboard/Modal";

function CreateInterviewCard() {
  const [open, setOpen] = useState(false);

  return (
    <>


      <Card
        className="group flex items-center cursor-pointer bg-white/70 backdrop-blur-md border border-indigo-200 shadow-md hover:shadow-indigo-200/50 w-56 h-60 ml-1 mr-3 mt-4 rounded-xl shrink-0 overflow-hidden hover:scale-[1.05] transition-all duration-300 ease-in-out"
        onClick={() => {
          setOpen(true);
        }}
      >
        <CardContent className="flex flex-col justify-center items-center mx-auto text-center">

          {/* Gradient Icon Badge */}
          <div className="p-4 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-300 group-hover:shadow-lg">
            <Plus size={38} className="opacity-90" />
          </div>

          {/* Title */}
          <CardTitle className="mt-4 text-sm font-semibold text-gray-800 tracking-tight">
            Create an Interview
          </CardTitle>

          {/* Subtle CTA */}
          <p className="text-[11px] text-indigo-600 mt-1 opacity-90 font-medium group-hover:text-purple-600 transition">
            Add new questions
          </p>

        </CardContent>
      </Card>

      <Modal
        open={open}
        closeOnOutsideClick={false}
        onClose={() => {
          setOpen(false);
        }}
      >
        <CreateInterviewModal open={open} setOpen={setOpen} />
      </Modal>
    </>
  );
}

export default CreateInterviewCard;
