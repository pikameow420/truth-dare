'use client';

import { useState } from 'react';

interface ReactionButtonsProps {
  onReaction: (emoji: string) => void;
  disabled?: boolean;
}

const reactions = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '😳', label: 'Blush' },
  { emoji: '💀', label: 'Dead' },
];

export default function ReactionButtons({ onReaction, disabled }: ReactionButtonsProps) {
  const [lastReaction, setLastReaction] = useState<string | null>(null);

  const handleReaction = (emoji: string) => {
    if (disabled) return;
    setLastReaction(emoji);
    onReaction(emoji);
    setTimeout(() => setLastReaction(null), 1000);
  };

  return (
    <div className="flex gap-3 justify-center animate-fade-in">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => handleReaction(r.emoji)}
          disabled={disabled}
          className={`
            text-2xl p-2 rounded-full transition-all duration-200 cursor-pointer
            ${lastReaction === r.emoji ? 'scale-125 bg-white/20' : 'hover:scale-110 hover:bg-white/10'}
            ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
          `}
          title={r.label}
        >
          {r.emoji}
        </button>
      ))}
    </div>
  );
}
