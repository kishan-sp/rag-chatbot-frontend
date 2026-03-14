'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FileUpload from '@/components/FileUpload';
import ChatWindow, { Message } from '@/components/ChatWindow';
import MessageInput from '@/components/MessageInput';

export default function ChatbotPage() {
  // Session ID — starts empty, set after first successful upload
  const [sessionId, setSessionId] = useState<string>('');

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

  // Task 6.1 — API key error state
  const [apiKeyError, setApiKeyError] = useState<boolean>(false);

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
        // Task 6.1 — Detect 401 and set apiKeyError
        if (res.status === 401) {
          setApiKeyError(true);
        }
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
      const errMsg = err instanceof Error && err.message.includes('401')
        ? 'Error: API authentication failed. Please check the backend API key configuration.'
        : 'Error: Failed to connect to the knowledge base. Please try again later.';
      setMessages((prev) => prev.map(msg =>
        msg.id === assistantId ? {
          ...msg,
          content: errMsg
        } : msg
      ));
      setIsChatLoading(false);
    }
  };

  // Dynamic Header Title (First Question)
  const firstQuestion = messages.find(m => m.role === 'user')?.content || 'New Session';

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">

      {/* Sidebar - Document Management */}
      <aside className="w-80 border-r border-border bg-background flex flex-col hidden lg:flex">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold tracking-tight">RAG Chatbot</h1>
        </div>
        
        <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Knowledge Base</h3>
            <FileUpload
              sessionId={sessionId}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              onSessionId={setSessionId}
            />
          </div>

          <div className="space-y-4">
            {status === 'ready' && chunkCount !== null && (
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Document Ready</p>
                <div className="text-sm text-slate-700 leading-relaxed">
                  We've indexed <span className="font-bold text-primary">{chunkCount}</span> sections. You can now ask detailed questions.
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10">
                <p className="text-xs font-bold text-destructive mb-1 uppercase tracking-wider">Upload Error</p>
                <p className="text-sm text-destructive/80 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            )}
            
            {apiKeyError && (
              <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 animate-in shake-in">
                <p className="text-xs font-bold text-destructive mb-1 uppercase tracking-wider">API Configuration Error</p>
                <p className="text-sm text-destructive/80 mb-3 leading-relaxed">
                  Invalid GROQ_API_KEY. Please verify your backend .env file.
                </p>
                <button
                  onClick={() => setApiKeyError(false)}
                  className="text-[10px] font-bold text-destructive underline uppercase tracking-widest hover:text-destructive/60"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-border mt-auto h-12 flex items-center">
           {/* Footer removed per user request */}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative h-full max-w-4xl mx-auto border-x border-border/40 bg-background shadow-2xl">
        {/* Header - Minimal & Dynamic */}
        <header className="h-16 flex items-center px-8 border-b border-border/40 bg-background/50 backdrop-blur-md z-20">
          <div className="flex items-center gap-3 w-full">
            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight truncate pr-4">
              {firstQuestion}
            </h2>
          </div>
        </header>

        {/* Chat window - scrolls */}
        <div className="flex-1 overflow-y-auto px-8 py-10 scroll-smooth">
          <ChatWindow messages={messages} />

        </div>

        {/* Message Input - Fixed/Floating effect */}
        <div className={`z-20 transition-all duration-300 ${apiKeyError ? 'grayscale pointer-events-none' : ''}`}>
          <MessageInput
            onSend={handleSendMessage}
            isLoading={isChatLoading}
            disabled={apiKeyError}
            sessionId={sessionId}
          />
        </div>
      </main>

    </div>
  );
}
