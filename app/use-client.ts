"use client";

import { useEffect, useState } from "react";
import { ChatClient, ChatMessage } from "./chat-client";

export function useChatClient(
  userId: string,
  userType: "lead" | "agent",
  sessionId: string,
  apiKey: string
) {
  const [client, setClient] = useState<ChatClient | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!this.apiKey || !this.sessionId || !this.userId) return;
    const chatClient = new ChatClient(
      // process.env.NEXT_PUBLIC_SONA_API_BASE_URL ?? "http://localhost:4000",
      "http://localhost:4000",
      userId,
      userType,
      sessionId,
      apiKey
    );

    chatClient
      .connect()
      .then(() => {
        setIsConnected(true);
        setClient(chatClient);
      })
      .catch(console.error);

    chatClient.onMessage((msg: any) => {
      setMessages((prev) => [...prev, msg]);
      setIsTyping(false);
    });

    chatClient.onTyping((data: any) => {
      if (data.userId !== userId) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      chatClient.disconnect();
    };
  }, [userId, userType, sessionId]);

  const sendMessage = async (leadId: string, agentId: string, message: string ) => {
    if (!client) return;
    await client.sendMessage(leadId, agentId, message);
  };

  const requestGreeting = async (agentId: string, leadId?: string) => {
    if (!client) return;
    const greeting = await client.requestGreeting(agentId, leadId);
    setMessages(prev => [...prev, greeting]);
    setIsTyping(false)
  };

  return {
    client,
    messages,
    isConnected,
    isTyping,
    setIsTyping,
    sendMessage,
    setMessages,
    requestGreeting
  };
}
