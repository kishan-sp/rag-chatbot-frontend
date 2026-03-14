import { TypingAnimation } from './ui/typing-animation';

interface ThinkingIndicatorProps {
    isLoading: boolean;
    hasStartedStreaming: boolean;
}

export default function ThinkingIndicator({ isLoading, hasStartedStreaming }: ThinkingIndicatorProps) {
    // Only show when the API call is in flight, but no tokens have arrived yet.
    if (!isLoading || hasStartedStreaming) return null;

    return (
        <div className="flex flex-col items-start max-w-full">
            <div className="px-5 py-4 bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm shadow-sm flex items-center w-fit">
                <TypingAnimation 
                    className="text-sm text-slate-500 font-normal"
                    duration={100}
                >
                    Thinking...
                </TypingAnimation>
            </div>
        </div>
    );
}
