'use client';

import React, { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
    onSend: (message: string) => void;
    isLoading: boolean;
    disabled?: boolean;
}

const MAX_LENGTH = 500;
const WARN_THRESHOLD = 450;

export default function MessageInput({ onSend, isLoading, disabled = false }: MessageInputProps) {
    const [input, setInput] = useState('');
    const [lengthError, setLengthError] = useState('');

    const currentLength = input.length;
    const isDisabled = isLoading || disabled;

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed || isDisabled) return;

        // Task 5.3 — JS-level guard (second layer of defence)
        if (trimmed.length > MAX_LENGTH) {
            setLengthError('Message too long. Please keep it under 500 characters.');
            return;
        }

        setLengthError('');
        onSend(trimmed);
        setInput('');
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        if (lengthError) setLengthError('');
    };

    return (
        <div className="flex flex-col w-full gap-1">
            <div className="flex items-end gap-2 w-full">
                {/* Task 5.1 — maxLength={500} */}
                <textarea
                    className={`flex-1 min-h-[44px] max-h-32 p-3 bg-transparent border-none focus:outline-none resize-none overflow-y-auto text-sm ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Type a message..."
                    value={input}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    disabled={isDisabled}
                    maxLength={MAX_LENGTH}
                    rows={1}
                />
                <button
                    onClick={handleSend}
                    disabled={isDisabled || !input.trim()}
                    className={`p-2 rounded-lg mb-1 flex-shrink-0 transition-colors ${isDisabled || !input.trim()
                            ? 'text-slate-300 bg-slate-100 cursor-not-allowed'
                            : 'text-white bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>

            {/* Task 5.2 — Live character counter */}
            <div className="flex justify-between items-center px-1">
                {lengthError ? (
                    <span className="text-xs text-red-500">{lengthError}</span>
                ) : (
                    <span />
                )}
                <span
                    className={`text-xs ml-auto ${currentLength >= WARN_THRESHOLD ? 'text-red-500 font-medium' : 'text-slate-400'}`}
                >
                    {currentLength}/{MAX_LENGTH}
                </span>
            </div>
        </div>
    );
}
