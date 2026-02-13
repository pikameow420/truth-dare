'use client';

import { useEffect, useRef } from 'react';

interface AIMessage {
  message: string;
  type: string;
  id: number;
}

interface AIChatBubbleProps {
  messages: AIMessage[];
}

export default function AIChatBubble({ messages }: AIChatBubbleProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-pink-400 font-medium">💘 Cupid AI</span>
      </div>
      <div className="max-h-48 overflow-y-auto space-y-2 scrollbar-thin pr-1">
        {messages.slice(-8).map((msg) => (
          <div
            key={msg.id}
            className={`
              animate-fade-in rounded-xl px-4 py-2.5 text-sm
              ${msg.type === 'dare'
                ? 'bg-orange-500/20 border border-orange-500/30 text-orange-200'
                : msg.type === 'farewell'
                ? 'bg-pink-500/20 border border-pink-500/30 text-pink-200'
                : msg.type === 'intro'
                ? 'bg-purple-500/20 border border-purple-500/30 text-purple-200'
                : 'bg-white/5 text-white/70'
              }
            `}
          >
            {msg.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
