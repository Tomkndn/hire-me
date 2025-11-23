import { NextResponse } from "next/server";
import {
  SYSTEM_PROMPT,
  generateQuestionsPrompt,
} from "@/lib/prompts/generate-questions";
import { logger } from "@/lib/logger";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  logger.info("generate-interview-questions request received");
  const body = await req.json();

  // Initialize Gemini Client
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  try {
    const prompt = `
${SYSTEM_PROMPT}

User Context:
${generateQuestionsPrompt(body)}

⚠️ Output must be a valid JSON object.
    `;

    // Generate the result
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const responseText = result.response.text();

    logger.info("Interview questions generated successfully");

    return NextResponse.json(
      { response: responseText },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error generating interview questions");
    console.error(error);

    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
