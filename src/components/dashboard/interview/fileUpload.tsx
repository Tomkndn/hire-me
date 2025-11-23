"use client";

import { toast } from "sonner";
import { Inbox } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { parsePdf } from "@/actions/parse-pdf";

type Props = {
  isUploaded: boolean;
  setIsUploaded: (isUploaded: boolean) => void;
  fileName: string;
  setFileName: (fileName: string) => void;
  setUploadedDocumentContext: (context: string) => void;
};

function FileUpload({
  isUploaded,
  setIsUploaded,
  fileName,
  setFileName,
  setUploadedDocumentContext,
}: Props) {
  const [uploading, setUploading] = useState(false);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      setFileName(file.name);
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Please upload a file smaller than 10MB.", {
          position: "bottom-right",
          duration: 3000,
        });

        return;
      }

      try {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const result = await parsePdf(formData);
        if (!result.success) {
          throw new Error(result.error);
        }
        const fullText = result.text || "";
        setUploadedDocumentContext(fullText);
        setIsUploaded(true);
      } catch (error) {
        console.log(error);
        toast.error("Error reading PDF", {
          description: "Please try again.",
          duration: 3000,
        });
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div className="p-3 bg-white rounded-xl w-full shadow-sm border border-slate-200">
      {!isUploaded ? (
        <div
          {...getRootProps({
            className:
              "border-2 border-dashed border-indigo-300 hover:border-indigo-500 transition-all duration-200 rounded-xl cursor-pointer bg-indigo-50/40 py-5 flex justify-center items-center flex-col",
          })}
        >
          <input {...getInputProps()} />
          <Inbox className="w-9 h-9 text-indigo-500" />
          <p className="mt-2 text-sm text-indigo-700 font-medium">
            Drop PDF Here
          </p>
          <p className="text-xs text-slate-500 mt-1">or click to upload</p>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-green-50 border border-green-300">
          <p className="text-sm text-green-800 font-medium">
            📄 {fileName}
          </p>
          <p className="text-xs text-green-700 mt-1">
            Uploaded successfully.{" "}
            <span
              className="underline text-indigo-700 cursor-pointer font-semibold"
              onClick={() => setIsUploaded(false)}
            >
              Reupload?
            </span>
          </p>
        </div>
      )}
    </div>

  );
}

export default FileUpload;
