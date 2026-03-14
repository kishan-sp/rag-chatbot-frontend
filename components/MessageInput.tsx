'use client';

import React, { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
    onSend: (message: string) => void;
    isLoading: boolean;
    disabled?: boolean;
    sessionId: string;
}

const MAX_LENGTH = 500;
const WARN_THRESHOLD = 450;

export default function MessageInput({ onSend, isLoading, disabled = false, sessionId }: MessageInputProps) {
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
        <div className="flex flex-col w-full max-w-3xl mx-auto px-4 pb-4">
            <div className={`relative flex flex-col bg-white border border-border shadow-sm rounded-2xl transition-all ${isDisabled ? 'opacity-60 overflow-hidden' : 'focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/5 focus-within:shadow-md'}`}>
                <textarea
                    className="w-full min-h-[50px] max-h-48 p-4 bg-transparent border-none focus:outline-none resize-none overflow-y-auto text-sm text-foreground leading-relaxed placeholder:text-muted-foreground/60"
                    placeholder="Ask questions about your document..."
                    value={input}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    disabled={isDisabled}
                    maxLength={MAX_LENGTH}
                    rows={1}
                />
                
                <div className="flex items-center justify-between px-4 pb-2">
                    <div className="flex items-center gap-2">
                        {lengthError ? (
                            <span className="text-[10px] text-destructive font-medium">{lengthError}</span>
                        ) : (
                            <span className={`text-[10px] ${currentLength >= WARN_THRESHOLD ? 'text-destructive font-medium' : 'text-muted-foreground/40 font-mono'}`}>
                                {currentLength}/{MAX_LENGTH}
                            </span>
                        )}
                    </div>
                    
                    <button
                        onClick={handleSend}
                        disabled={isDisabled || !input.trim()}
                        className={`p-1.5 rounded-xl transition-all duration-200 ${isDisabled || !input.trim()
                                ? 'text-muted-foreground/20'
                                : 'text-primary hover:bg-primary/5'
                            }`}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <p className="text-[10px] text-muted-foreground/40 text-center mt-2 font-medium uppercase tracking-widest">
                Chatting with {sessionId ? 'Document' : 'No Document'}
            </p>
        </div>
    );
}
