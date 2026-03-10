'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FileUpload from '@/components/FileUpload';

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

        <CardContent className="flex-1 bg-slate-50/50 p-4 overflow-y-auto">
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            [ Chat messages area ]
          </div>
        </CardContent>

        <div className="p-4 bg-white border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 text-slate-500 text-sm">
            [ Input bar ]
          </div>
        </div>
      </Card>

    </div>
  );
}
