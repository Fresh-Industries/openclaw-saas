/**
 * AI Routes - Chat with agents
 */

import { Router, Request, Response } from "express";
import { streamText, CoreMessage, generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { prisma } from "../lib/db";
import { z } from "zod";

const router = Router();

const chatSchema = z.object({
  userId: z.string(),
  message: z.string(),
  skillPacks: z.array(z.string()).optional(),
  stream: z.boolean().optional(),
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-demo",
});

/**
 * POST /api/ai/chat
 * Send a message to the AI agent with streaming support
 */
router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { userId, message, skillPacks, stream = false } = chatSchema.parse(req.body);

    // Get user's skill packs
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const packs = skillPacks || user?.skillPacks || ["personal"];

    // Create system prompt
    const systemPrompt = `You are an OpenClaw AI agent.

Your skills include:
${packs.map((p) => `- ${p}`).join("\n")}

Guidelines:
- Be helpful, concise, and practical
- Use your tools when needed
- Ask clarifying questions when requirements are unclear
- Always prefer action over inaction`;

    const messages: CoreMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];

    if (stream) {
      // Streaming response for Vercel AI SDK
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const result = await streamText({
        model: openai("gpt-4o"),
        messages,
        onFinish: () => {
          res.end();
        },
        onError: (error) => {
          console.error("Streaming error:", error);
          res.end();
        },
      });

      // Pipe the stream to response
      for await (const chunk of result.textStream) {
        res.write(chunk);
      }

      return;
    }

    // Non-streaming response
    const result = await generateText({
      model: openai("gpt-4o"),
      messages,
    });

    res.json({
      text: result.text,
      usage: result.usage,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Chat failed" });
  }
});

/**
 * POST /api/ai/generate
 * Generate content using AI
 */
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { prompt, model = "gpt-4o" } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Prompt required" });
      return;
    }

    const result = await generateText({
      model: openai(model),
      messages: [{ role: "user", content: prompt }],
    });

    res.json({
      text: result.text,
      usage: result.usage,
    });
  } catch (error) {
    console.error("Generate error:", error);
    res.status(500).json({ error: "Generation failed" });
  }
});

/**
 * POST /api/ai/analyze
 * Analyze text with AI
 */
router.post("/analyze", async (req: Request, res: Response) => {
  try {
    const { text, task = "summarize" } = req.body;

    if (!text) {
      res.status(400).json({ error: "Text required" });
      return;
    }

    const prompts: Record<string, string> = {
      summarize: `Summarize the following text concisely:\n\n${text}`,
      extract: `Extract key points from the following text:\n\n${text}`,
      sentiment: `Analyze the sentiment of the following text (positive/negative/neutral):\n\n${text}`,
      improve: `Improve the following text:\n\n${text}`,
    };

    const result = await generateText({
      model: openai("gpt-4o"),
      messages: [{ role: "user", content: prompts[task] || prompts.summarize }],
    });

    res.json({
      text: result.text,
      usage: result.usage,
    });
  } catch (error) {
    console.error("Analyze error:", error);
    res.status(500).json({ error: "Analysis failed" });
  }
});

export default router;
