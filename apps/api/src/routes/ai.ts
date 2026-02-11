/**
 * AI Routes - Chat with agents
 */

import { Router, Request, Response } from "express";
import { generateChat, streamChat, createAgentSystemPrompt, CoreMessage } from "../lib/ai";
import { prisma } from "../lib/db";
import { z } from "zod";

const router = Router();

const chatSchema = z.object({
  userId: z.string(),
  message: z.string(),
  skillPacks: z.array(z.string()).optional(),
  stream: z.boolean().optional(),
});

/**
 * POST /api/ai/chat
 * Send a message to the AI agent (fallback when container is unavailable)
 */
router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { userId, message, skillPacks, stream = false } = chatSchema.parse(req.body);

    // Get user's skill packs
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const packs = skillPacks || user?.skillPacks || ["personal"];

    // Create system prompt based on skill packs
    const systemPrompt = createAgentSystemPrompt("OpenClaw Agent", packs);

    const messages: CoreMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];

    if (stream) {
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Transfer-Encoding", "chunked");

      for await (const chunk of streamChat(messages)) {
        res.write(chunk);
      }
      res.end();
      return;
    }

    const result = await generateChat(messages);
    res.json(result);
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
    const { prompt, type = "text", model = "gpt-4o" } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Prompt required" });
      return;
    }

    const result = await generateChat(
      [{ role: "user", content: prompt }],
      { model }
    );

    res.json(result);
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

    const result = await generateChat(
      [{ role: "user", content: prompts[task] || prompts.summarize }]
    );

    res.json(result);
  } catch (error) {
    console.error("Analyze error:", error);
    res.status(500).json({ error: "Analysis failed" });
  }
});

export default router;
