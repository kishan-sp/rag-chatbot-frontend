'use client';

import React, { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
    onSend: (message: string) => void;
    isLoading: boolean;
}

export default function MessageInput({ onSend, isLoading }: MessageInputProps) {
    const [input, setInput] = useState('');

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        // Security: Enforce backend matching 2000 character limit defensively
        if (trimmed.length > 2000) return;

        onSend(trimmed);
        setInput('');
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex items-end gap-2 w-full">
            <textarea
                className={`flex-1 min-h-[44px] max-h-32 p-3 bg-transparent border-none focus:outline-none resize-none overflow-y-auto text-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                maxLength={2000}
                rows={1}
            />
            <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className={`p-2 rounded-lg mb-1 flex-shrink-0 transition-colors ${isLoading || !input.trim()
                        ? 'text-slate-300 bg-slate-100 cursor-not-allowed'
                        : 'text-white bg-blue-600 hover:bg-blue-700'
                    }`}
            >
                <Send className="w-4 h-4" />
            </button>
        </div>
    );
}
