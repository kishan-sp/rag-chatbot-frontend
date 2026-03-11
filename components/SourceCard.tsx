import React from 'react';
import { Source } from './ChatWindow';
import { FileText } from 'lucide-react';

interface SourceCardProps {
    source: Source;
}

export default function SourceCard({ source }: SourceCardProps) {
    return (
        <div className="mt-2 ml-2 bg-slate-50 border border-slate-200 rounded-md p-3 max-w-[90%] sm:max-w-[80%]">
            <div className="flex items-center gap-2 mb-1">
                <FileText className="w-3 h-3 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Page {source.page_number}
                </span>
            </div>
            <p className="text-xs text-slate-500 italic whitespace-pre-wrap break-words border-l-2 border-slate-300 pl-2">
                "{source.snippet}..."
            </p>
        </div>
    );
}
