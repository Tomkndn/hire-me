import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@/lib/logger";
import {
  SYSTEM_PROMPT,
  getCommunicationAnalysisPrompt,
} from "@/lib/prompts/communication-analysis";

export async function POST(req: Request) {
  logger.info("analyze-communication request received");

  try {
    const body = await req.json();
    const { transcript } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 },
      );
    }

    // 👉 Setup Gemini Client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-thinking-exp",
    });

    // 👉 Generate message content
    const prompt = getCommunicationAnalysisPrompt(transcript);

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

    // 👉 Safely parse JSON (handles Gemini ```json blocks)
    let raw = result.response.text();
    let parsed = {};

    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    }

    logger.info("Communication analysis completed successfully");

    return NextResponse.json({ analysis: parsed }, { status: 200 });
  } catch (error) {
    logger.error("Error analyzing communication skills", error ?? "");

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
