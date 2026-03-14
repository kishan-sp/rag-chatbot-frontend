import React from 'react';
import { Source } from './ChatWindow';
import { FileText } from 'lucide-react';

interface SourceCardProps {
    source: Source;
    index: number;
    onClick: (source: Source) => void;
}

export default function SourceCard({ source, index, onClick }: SourceCardProps) {
    return (
        <button
            onClick={() => onClick(source)}
            className="inline-flex items-center gap-1.5 px-2 py-1 bg-secondary hover:bg-accent border border-border rounded-md text-[11px] font-medium text-muted-foreground transition-colors cursor-pointer mr-2 mb-2 group shadow-sm"
            title={`${source.file_name}, Page ${source.page}`}
        >
            <FileText className="w-3 h-3 text-primary group-hover:text-primary transition-colors" />
            <span className="truncate max-w-[120px]">
                [{index + 1}] {source.file_name}
            </span>
            <span className="opacity-60 font-mono text-[9px]">
                p.{source.page}
            </span>
        </button>
    );
}
