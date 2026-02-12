/**
 * AI Routes - Chat with agents with multi-model support
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
  model: z.string().optional(),
});

const MODELS = {
  // OpenAI
  "gpt-4o": { provider: "openai", contextWindow: 128000, maxOutput: 4096 },
  "gpt-4o-mini": { provider: "openai", contextWindow: 128000, maxOutput: 16384 },
  "gpt-4-turbo": { provider: "openai", contextWindow: 128000, maxOutput: 4096 },
  
  // MiniMax
  "minimax-m2.5": { provider: "minimax", contextWindow: 200000, maxOutput: 8192 },
  
  // Anthropic (via OpenAI compatible API)
  "claude-sonnet-4-20250514": { provider: "openai", contextWindow: 200000, maxOutput: 8192 },
  "claude-opus-4-20250514": { provider: "openai", contextWindow: 200000, maxOutput: 8192 },
};

// OpenAI provider (also used for Anthropic via compatible API)
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-demo",
  baseURL: process.env.ANTHROPIC_API_URL, // Optional for Claude
});

// MiniMax provider via OpenAI-compatible API
const minimax = createOpenAI({
  apiKey: process.env.MINIMAX_API_KEY || "demo-key",
  baseURL: process.env.MINIMAX_API_URL || "https://api.minimax.chat/v1",
});

/**
 * Get available models
 */
router.get("/models", (_req: Request, res: Response) => {
  res.json({
    models: Object.entries(MODELS).map(([id, info]) => ({
      id,
      provider: info.provider,
      contextWindow: info.contextWindow,
      maxOutput: info.maxOutput,
    })),
  });
});

/**
 * POST /api/ai/chat
 * Send a message to the AI agent with multi-model support
 */
router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { userId, message, skillPacks, stream = false, model = "minimax-m2.5" } = 
      chatSchema.parse(req.body);

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

    // Get model config
    const modelConfig = MODELS[model as keyof typeof MODELS];
    const modelId = modelConfig ? model : "minimax-m2.5";

    if (stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      try {
        const result = await streamText({
          model: modelConfig?.provider === "minimax" 
            ? minimax(modelId)
            : openai(modelId) as any,
          messages,
          maxTokens: modelConfig?.maxOutput || 4096,
          onFinish: () => {
            res.end();
          },
          onError: (error) => {
            console.error("Streaming error:", error);
            res.end();
          },
        });

        for await (const chunk of result.textStream) {
          res.write(chunk);
        }
      } catch (error) {
        console.error("MiniMax streaming error:", error);
        res.end();
      }

      return;
    }

    // Non-streaming response
    try {
      const result = await generateText({
        model: modelConfig?.provider === "minimax"
          ? minimax(modelId)
          : openai(modelId) as any,
        messages,
        maxTokens: modelConfig?.maxOutput || 4096,
      });

      res.json({
        text: result.text,
        usage: result.usage,
        model,
      });
    } catch (error) {
      console.error("Generation error:", error);
      res.status(500).json({ error: "Generation failed" });
    }
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
    const { prompt, model = "minimax-m2.5" } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Prompt required" });
      return;
    }

    const modelConfig = MODELS[model as keyof typeof MODELS];

    const result = await generateText({
      model: modelConfig?.provider === "minimax"
        ? minimax(model)
        : openai(model) as any,
      messages: [{ role: "user", content: prompt }],
      maxTokens: modelConfig?.maxOutput || 4096,
    });

    res.json({
      text: result.text,
      usage: result.usage,
      model,
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
    const { text, task = "summarize", model = "minimax-m2.5" } = req.body;

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

    const modelConfig = MODELS[model as keyof typeof MODELS];

    const result = await generateText({
      model: modelConfig?.provider === "minimax"
        ? minimax(model)
        : openai(model) as any,
      messages: [{ role: "user", content: prompts[task] || prompts.summarize }],
      maxTokens: modelConfig?.maxOutput || 4096,
    });

    res.json({
      text: result.text,
      usage: result.usage,
      model,
    });
  } catch (error) {
    console.error("Analyze error:", error);
    res.status(500).json({ error: "Analysis failed" });
  }
});

/**
 * POST /api/ai/chat/complete
 * Non-streaming chat completion
 */
router.post("/complete", async (req: Request, res: Response) => {
  try {
    const { messages, model = "minimax-m2.5" } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Messages array required" });
      return;
    }

    const modelConfig = MODELS[model as keyof typeof MODELS];

    const result = await generateText({
      model: modelConfig?.provider === "minimax"
        ? minimax(model)
        : openai(model) as any,
      messages: messages as CoreMessage[],
      maxTokens: modelConfig?.maxOutput || 4096,
    });

    res.json({
      text: result.text,
      usage: result.usage,
      model,
    });
  } catch (error) {
    console.error("Complete error:", error);
    res.status(500).json({ error: "Completion failed" });
  }
});

export default router;
