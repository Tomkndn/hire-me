import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ResponseService } from "@/services/responses.service";
import { InterviewService } from "@/services/interviews.service";
import {
  SYSTEM_PROMPT,
  createUserPrompt,
} from "@/lib/prompts/generate-insights";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  logger.info("generate-insights request received");
  const body = await req.json();

  // 👉 Fetch interview data
  const responses = await ResponseService.getAllResponses(body.interviewId);
  const interview = await InterviewService.getInterviewById(body.interviewId);

  // 👉 Build interview data for LLM
  let callSummaries = "";
  if (responses) {
    responses.forEach((response) => {
      callSummaries += response.details?.call_analysis?.call_summary || "";
    });
  }

  // 👉 Setup Gemini Client
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-thinking-exp",
  });

  try {
    // 👉 Build user prompt
    const prompt = createUserPrompt(
      callSummaries,
      interview.name,
      interview.objective,
      interview.description,
    );

    // 👉 Gemini Request
    const result = await model.generateContent({
      contents: [
        {
          role: "system",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // 👉 Format / Parse Response
    let content = result.response.text();
    let insightsResponse;

    try {
      insightsResponse = JSON.parse(content);
    } catch {
      // 🛠 Gemini sometimes wraps JSON in ```json ```
      const cleaned = content.replace(/```json|```/g, "").trim();
      insightsResponse = JSON.parse(cleaned);
    }

    // 👉 Save to DB
    await InterviewService.updateInterview(
      { insights: insightsResponse.insights },
      body.interviewId,
    );

    logger.info("Insights generated successfully");

    return NextResponse.json({ response: insightsResponse }, { status: 200 });
  } catch (error) {
    logger.error("Error generating insights", error ?? "");

    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
