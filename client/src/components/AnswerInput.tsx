'use client';

import { useState } from 'react';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  isMyTurn: boolean;
}

export default function AnswerInput({ onSubmit, disabled, isMyTurn }: AnswerInputProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim() && !disabled) {
      onSubmit(answer.trim());
      setAnswer('');
    }
  };

  if (!isMyTurn) {
    return (
      <div className="text-center py-4">
        <p className="text-white/40 text-sm italic">Waiting for their answer...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto animate-fade-in">
      <div className="flex gap-2">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer..."
          disabled={disabled}
          className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all"
          autoFocus
        />
        <button
          type="submit"
          disabled={disabled || !answer.trim()}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          Send
        </button>
      </div>
    </form>
  );
}
