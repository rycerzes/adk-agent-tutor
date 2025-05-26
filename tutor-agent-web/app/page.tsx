"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User } from "lucide-react";
import { MessageContent } from "@/components/MessageContent";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatResponse {
  content?: {
    parts: Array<{
      text?: string;
      functionCall?: any;
    }>;
  };
  author: string;
  timestamp: number;
  id: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = "u_123";
  const appName = "tutor_agent";

  // Initialize session on component mount
  useEffect(() => {
    initializeSession();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initializeSession = async () => {
    try {
      const newSessionId = `s_${Date.now()}`;
      const response = await fetch(`http://localhost:8000/apps/${appName}/users/${userId}/sessions/${newSessionId}`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      if (response.ok) {
        setSessionId(newSessionId);
        console.log("Session created successfully:", newSessionId);
      } else {
        console.error("Failed to create session:", response.status, response.statusText);
        // Fallback: use a session ID anyway for testing
        setSessionId(newSessionId);
      }
    } catch (error) {
      console.error("Error creating session:", error);
      // Fallback: use a session ID anyway for testing
      const fallbackSessionId = `s_${Date.now()}`;
      setSessionId(fallbackSessionId);
      console.log("Using fallback session ID:", fallbackSessionId);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    const messageText = input.trim();
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/run", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          appName,
          userId,
          sessionId,
          newMessage: {
            role: "user",
            parts: [{
              text: messageText
            }]
          }
        }),
      });

      if (response.ok) {
        const chatResponses: ChatResponse[] = await response.json();
        console.log("API Response:", chatResponses);

        // Process responses and extract text content
        const assistantMessages = chatResponses
          .filter(resp => resp.content?.parts?.some(part => part.text))
          .map(resp => {
            const textParts = resp.content?.parts?.filter(part => part.text) || [];
            const content = textParts.map(part => part.text).join(" ");

            return {
              id: resp.id,
              role: "assistant" as const,
              content: content || "I'm processing your request...",
              timestamp: resp.timestamp * 1000, // Convert to milliseconds
            };
          });

        if (assistantMessages.length > 0) {
          setMessages(prev => [...prev, ...assistantMessages]);
        } else {
          // Fallback if no text content found
          setMessages(prev => [...prev, {
            id: `fallback_${Date.now()}`,
            role: "assistant",
            content: "I'm working on your request. The response may include function calls or other processing.",
            timestamp: Date.now(),
          }]);
        }
      } else {
        const errorText = await response.text();
        console.error("Failed to send message:", response.status, response.statusText, errorText);
        setMessages(prev => [...prev, {
          id: `error_${Date.now()}`,
          role: "assistant",
          content: `Sorry, I encountered an error processing your message. (${response.status}: ${response.statusText})`,
          timestamp: Date.now(),
        }]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setMessages(prev => [...prev, {
          id: `error_${Date.now()}`,
          role: "assistant",
          content: "Sorry, I couldn't connect to the server. Please check if the API server is running and CORS is configured.",
          timestamp: Date.now(),
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: `error_${Date.now()}`,
          role: "assistant",
          content: "Sorry, I couldn't connect to the server.",
          timestamp: Date.now(),
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-950 to-black p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl h-full flex flex-col">
        <Card className="flex-1 flex flex-col shadow-lg bg-gray-900 border-gray-800 overflow-hidden">
          <CardHeader className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-gray-100">
              <Bot className="w-6 h-6 text-blue-500" />
              AI Tutor Chat
            </CardTitle>
            {sessionId && (
              <p className="text-sm text-gray-400">Session: {sessionId}</p>
            )}
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 #1f2937' }}>
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <Bot className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                    <p>Welcome! Ask me anything about math, science, or any topic you'd like to learn about.</p>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-blue-900">
                          <Bot className="w-4 h-4 text-blue-400" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === "user"
                          ? "bg-blue-800 text-gray-100"
                          : "bg-gray-800 border border-gray-700 text-gray-200"
                        }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        <MessageContent content={message.content} />
                      </div>
                      <p className={`text-xs mt-1 ${message.role === "user" ? "text-blue-300" : "text-gray-500"
                        }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>

                    {message.role === "user" && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-gray-800">
                          <User className="w-4 h-4 text-gray-300" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-blue-900">
                        <Bot className="w-4 h-4 text-blue-400" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t border-gray-800 p-4 bg-gray-900/50 backdrop-blur-sm flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  disabled={!sessionId || isLoading}
                  className="flex-1 bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || !sessionId || isLoading}
                  size="icon"
                  className="bg-blue-700 hover:bg-blue-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}