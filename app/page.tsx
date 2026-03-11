'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FileUpload from '@/components/FileUpload';
import ChatWindow, { Message } from '@/components/ChatWindow';
import MessageInput from '@/components/MessageInput';
import ThinkingIndicator from '@/components/ThinkingIndicator';

export default function ChatbotPage() {
  // Generate a stable session ID on first load
  const [sessionId] = useState<string>(() => crypto.randomUUID());

  // Status boundaries for the Chat component layout
  const [status, setStatus] = useState<'idle' | 'uploading' | 'ready' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [chunkCount, setChunkCount] = useState<number | null>(null);

  const handleUploadSuccess = (count: number) => {
    setChunkCount(count);
    setStatus('ready');
    setErrorMessage('');
  };

  const handleUploadError = (message: string) => {
    setErrorMessage(message);
    setStatus('error');
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Security: Cleanup interval on unmount to prevent streaming memory leaks
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    if (!chunkCount) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Please upload a document first.',
          timestamp: new Date()
        }
      ]);
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    const assistantId = crypto.randomUUID();
    const assistantPlaceholder: Message = {
      id: assistantId,
      role: 'assistant',
      content: '', // Starts empty for Thinking indicator
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
    setIsChatLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const formattedHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const payload = {
        question: text,
        session_id: sessionId,
        chat_history: formattedHistory
      };

      const res = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const fullAnswer = data.answer || '';
      const sources = data.sources || [];

      // Simulated Streaming implementation
      let currentIndex = 0;

      streamIntervalRef.current = setInterval(() => {
        // Jump 2-4 characters to simulate LLM token streams
        const nextIndex = Math.min(currentIndex + Math.floor(Math.random() * 3) + 2, fullAnswer.length);
        const currentText = fullAnswer.substring(0, nextIndex);

        setMessages((prev) => prev.map(msg =>
          msg.id === assistantId ? { ...msg, content: currentText } : msg
        ));

        currentIndex = nextIndex;

        if (currentIndex >= fullAnswer.length) {
          if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;

          setMessages((prev) => prev.map(msg =>
            msg.id === assistantId ? { ...msg, sources } : msg
          ));
          setIsChatLoading(false);
        }
      }, 30);

    } catch (err: unknown) {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      setMessages((prev) => prev.map(msg =>
        msg.id === assistantId ? {
          ...msg,
          content: 'Error: Failed to connect to the knowledge base. Please try again later.'
        } : msg
      ));
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 p-4 gap-4">

      {/* Sidebar Panel */}
      <Card className="w-80 flex flex-col shadow-md rounded-xl border border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold">Document Knowledge</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 flex-1">
          <FileUpload
            sessionId={sessionId}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />

          <div className="flex flex-col gap-2">
            {status === 'ready' && (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 text-sm py-1.5 px-3">
                Document ready — {chunkCount} sections indexed. Ask anything.
              </Badge>
            )}

            {status === 'error' && (
              <Badge variant="destructive" className="whitespace-normal py-1.5 px-3">
                {errorMessage}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Chat Panel */}
      <Card className="flex flex-1 flex-col shadow-md rounded-xl border border-slate-200 overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100 z-10">
          <CardTitle className="text-lg font-bold">Chat</CardTitle>
        </CardHeader>

        <CardContent className="flex-1 bg-slate-50/50 p-4 overflow-y-auto overflow-x-hidden flex flex-col">
          <ChatWindow messages={messages} />

          {isChatLoading && (
            <div className="mt-2 w-full">
              <ThinkingIndicator
                isLoading={isChatLoading}
                hasStartedStreaming={messages.length > 0 && messages[messages.length - 1].content.length > 0}
              />
            </div>
          )}
        </CardContent>

        <div className="p-4 bg-white border-t border-slate-100">
          <MessageInput onSend={handleSendMessage} isLoading={isChatLoading} />
        </div>
      </Card>

    </div>
  );
}
