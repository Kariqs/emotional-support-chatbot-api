import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Request, Response } from "express";

// Validate API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY in your .env file.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const chatController = async (req: Request, res: Response): Promise<void> => {
  const { message } = req.body as { message?: string };

  // Input validation
  if (!message || typeof message !== "string" || !message.trim()) {
    res.status(400).json({
      error: "Message is required and must be a non-empty string.",
    });
    return;
  }

  if (message.length > 2000) {
    res.status(400).json({
      error: "Message is too long. Maximum 2000 characters.",
    });
    return;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an empathetic emotional support chatbot designed to provide comfort and understanding.

Guidelines:
- Respond with compassion, validation, and gentle encouragement
- Listen actively and acknowledge the user's feelings
- Avoid giving medical diagnoses or professional advice
- If the user expresses thoughts of self-harm or crisis, encourage them to seek professional help immediately
- Keep responses warm, supportive, and conversational
- Be concise but thorough (2–4 sentences unless more detail is needed)

User message: ${message}

Your supportive response:
    `;

    const result = await model.generateContent(prompt);
    const botResponse = result.response.text();

    res.json({ reply: botResponse });
  } catch (err: unknown) {
    console.error("Gemini API Error:", err);

    const error = err as { message?: string; status?: number };
    const msg = error?.message || "Unknown error";

    if (msg.includes("API key") || error.status === 401) {
      res.status(401).json({
        error: "Invalid API key. Please check your GEMINI_API_KEY in .env file.",
      });
      return;
    }

    if (msg.includes("quota") || error.status === 429) {
      res.status(429).json({
        error: "API quota exceeded. Please try again later.",
      });
      return;
    }

    if (error.status === 404) {
      res.status(500).json({
        error: "Model not available. Visit /models to see available options.",
      });
      return;
    }

    res.status(500).json({
      error: "An unexpected error occurred. Please try again.",
      details: process.env.NODE_ENV === "development" ? msg : undefined,
    });
  }
};
