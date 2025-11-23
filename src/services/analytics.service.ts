"use server";

import { ResponseService } from "@/services/responses.service";
import { InterviewService } from "@/services/interviews.service";
import { Question } from "@/types/interview";
import { Analytics } from "@/types/response";
import {
  getInterviewAnalyticsPrompt,
  SYSTEM_PROMPT,
} from "@/lib/prompts/analytics";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateInterviewAnalytics = async (payload: {
  callId: string;
  interviewId: string;
  transcript: string;
}) => {
  const { callId, interviewId, transcript } = payload;

  try {
    const response = await ResponseService.getResponseByCallId(callId);
    const interview = await InterviewService.getInterviewById(interviewId);

    // 📌 If analytics already saved, return cached result
    if (response.analytics) {
      return { analytics: response.analytics as Analytics, status: 200 };
    }

    const interviewTranscript =
      transcript || response.details?.transcript || "";

    const questions = interview?.questions || [];
    const mainInterviewQuestions = questions
      .map((q: Question, index: number) => `${index + 1}. ${q.question}`)
      .join("\n");

    // 🔧 Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-thinking-exp",
    });

    const prompt = getInterviewAnalyticsPrompt(
      interviewTranscript,
      mainInterviewQuestions,
    );

    // 🤖 Generate structured JSON output
    const result = await model.generateContent({
      contents: [
        { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "user", parts: [{ text: prompt }] },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // 🧠 Parse JSON safely (handles ```json blocks)
    let raw = result.response.text();
    let analyticsResponse: any = {};

    try {
      analyticsResponse = JSON.parse(raw);
    } catch {
      analyticsResponse = JSON.parse(raw.replace(/```json|```/g, "").trim());
    }

    // 🏷️ Attach questions back to response
    analyticsResponse.mainInterviewQuestions = questions.map(
      (q: Question) => q.question,
    );

    return { analytics: analyticsResponse, status: 200 };
  } catch (error) {
    console.error("Error in Gemini request:", error);
    
    return { error: "internal server error", status: 500 };
  }
};
