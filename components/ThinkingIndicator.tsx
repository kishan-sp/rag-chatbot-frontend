import React from 'react';

interface ThinkingIndicatorProps {
    isLoading: boolean;
    hasStartedStreaming: boolean;
}

export default function ThinkingIndicator({ isLoading, hasStartedStreaming }: ThinkingIndicatorProps) {
    // Only show when the API call is in flight, but no tokens have arrived yet.
    if (!isLoading || hasStartedStreaming) return null;

    return (
        <div className="flex flex-col items-start max-w-full">
            <div className="px-5 py-4 bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 w-fit">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
            </div>
        </div>
    );
}
