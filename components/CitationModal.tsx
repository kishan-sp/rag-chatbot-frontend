'use client';

import React from 'react';
import { X, FileText, ExternalLink } from 'lucide-react';
import { Source } from './ChatWindow';

interface CitationModalProps {
    source: Source | null;
    onClose: () => void;
}

export default function CitationModal({ source, onClose }: CitationModalProps) {
    if (!source) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-bold text-slate-800 truncate max-w-[300px]">
                            {source.file_name}
                        </h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Page {source.page}
                        </span>
                        <div className="h-px flex-1 bg-slate-100"></div>
                    </div>
                    
                    <div className="relative group">
                        <div className="absolute -left-3 top-0 bottom-0 w-1 bg-primary/20 rounded-full"></div>
                        <p className="text-sm text-slate-600 leading-relaxed italic whitespace-pre-wrap">
                            "{source.snippet}..."
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
