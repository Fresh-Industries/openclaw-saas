/**
 * AI Service - Vercel AI SDK Integration
 */

import { generateText, streamText, CoreMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-demo",
});

export interface ChatOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatResult {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Generate a text response (non-streaming)
 */
export async function generateChat(
  messages: CoreMessage[],
  options: ChatOptions = {}
): Promise<ChatResult> {
  const { 
    model = "gpt-4o", 
    maxTokens = 1024, 
    temperature = 0.7 
  } = options;

  const result = await generateText({
    model: openai(model),
    messages,
    maxTokens,
    temperature,
  });

  return {
    text: result.text,
    usage: result.usage ? {
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
      totalTokens: result.usage.totalTokens,
    } : undefined,
  };
}

/**
 * Stream a text response
 */
export async function* streamChat(
  messages: CoreMessage[],
  options: ChatOptions = {}
): AsyncGenerator<string> {
  const { 
    model = "gpt-4o", 
    maxTokens = 1024, 
    temperature = 0.7 
  } = options;

  const result = await streamText({
    model: openai(model),
    messages,
    maxTokens,
    temperature,
  });

  for await (const chunk of result.textStream) {
    yield chunk;
  }
}

/**
 * Create a system prompt for OpenClaw agent
 */
export function createAgentSystemPrompt(role: string, skills: string[]): string {
  return `You are ${role}, an AI assistant powered by OpenClaw.

Your skills include:
${skills.map((s) => `- ${s}`).join("\n")}

Guidelines:
- Be helpful, concise, and practical
- Use your tools when needed
- Ask clarifying questions when requirements are unclear
- Always prefer action over inaction

Remember: You are here to help the user accomplish their goals efficiently.`;
}
