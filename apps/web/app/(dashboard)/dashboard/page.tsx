"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "better-auth/react";
import { useChat } from "ai/react";
import { Send, Bot, User, Loader2, AlertCircle, Settings, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const MODELS = [
  { id: "minimax-m2.1", name: "MiniMax M2.1", provider: "MiniMax", context: "200K" },
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", context: "128K" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", context: "128K" },
  { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", provider: "Anthropic", context: "200K" },
  { id: "claude-opus-4-20250514", name: "Claude Opus 4", provider: "Anthropic", context: "200K" },
];

export default function ChatPage() {
  const { data: session } = useSession();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedModel, setSelectedModel] = useState("minimax-m2.1");
  const [localMessages, setLocalMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your OpenClaw AI agent. How can I help you today?",
      timestamp: new Date(),
    },
  ]);

  // Use Vercel AI SDK's useChat for streaming
  const {
    messages: streamingMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  } = useChat({
    api: "/api/ai/chat",
    body: {
      userId: session?.user?.id || "demo",
      stream: true,
      model: selectedModel,
    },
    onFinish: (message) => {
      setLocalMessages((prev) => [
        ...prev.filter((m) => m.id !== "streaming"),
        {
          id: message.id,
          role: message.role,
          content: message.content,
          timestamp: new Date(),
        },
      ]);
    },
  });

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages, streamingMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setLocalMessages((prev) => [...prev, userMessage]);
    handleSubmit(e as any);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as React.FormEvent);
    }
  };

  const getModelInfo = (id: string) => {
    return MODELS.find((m) => m.id === id) || MODELS[0];
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Model Selector */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Model:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {getModelInfo(selectedModel).name}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {MODELS.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{model.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {model.provider} • {model.context} context
                    </p>
                  </div>
                  {selectedModel === model.id && (
                    <Bot className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <span className="text-xs text-muted-foreground">
          {getModelInfo(selectedModel).provider}
        </span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        <div className="space-y-4 pb-4">
          {/* Local messages */}
          {localMessages
            .filter((m) => !streamingMessages.some((sm) => sm.id === m.id))
            .map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  {message.role === "assistant" ? (
                    <>
                      <AvatarImage src="/bot.png" />
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src={session?.user?.image} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>

                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

          {/* Streaming message */}
          {streamingMessages.slice(localMessages.length - 1).map((message) => (
            <div key={message.id} className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                {isLoading ? (
                  <div className="flex items-center gap-1">
                    <span className="text-sm">Thinking</span>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </div>
          ))}

          {/* Error */}
          {error && (
            <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-700">Something went wrong</p>
                <p className="text-sm text-red-600">{error.message}</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t pt-4 mt-4">
        <form onSubmit={handleSend} className="flex gap-2">
          <Textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${getModelInfo(selectedModel).name}...`}
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
