'use client';

import React, { useEffect, useRef } from 'react';
import SourceCard from './SourceCard';

export interface Source {
    page_number: number;
    snippet: string;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    sources?: Source[];
}

interface ChatWindowProps {
    messages: Message[];
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWindow({ messages }: ChatWindowProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col gap-4 w-full h-full pb-2">
            {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                    <p className="text-sm">No messages yet.</p>
                </div>
            ) : (
                messages.map((message) => {
                    const isUser = message.role === 'user';
                    return (
                        <div
                            key={message.id}
                            className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
                        >
                            <div
                                className={`px-4 py-2.5 rounded-2xl max-w-[85%] sm:max-w-[75%] shadow-sm whitespace-pre-wrap break-words text-sm ${isUser
                                    ? 'bg-blue-600 text-white rounded-tr-sm'
                                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                                    }`}
                            >
                                {/* 
                  Security Requirement: Render content strictly as plain text. 
                  React natively escapes strings. Absolutely no dangerouslySetInnerHTML.
                */}
                                {message.content}
                            </div>

                            <div className="text-[11px] text-slate-400 mt-1 px-1">
                                {formatTime(message.timestamp)}
                            </div>

                            {/* Source cards */}
                            {!isUser && message.sources && message.sources.length > 0 && (
                                <div className="mt-1 w-full space-y-2">
                                    {message.sources.map((source, idx) => (
                                        <SourceCard key={idx} source={source} />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
            {/* Dummy div for auto-scroll target */}
            <div ref={bottomRef} className="h-px" />
        </div>
    );
}
