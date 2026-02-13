'use client';

import { useState, useEffect } from 'react';

export default function EndPage() {
  const [phase, setPhase] = useState<'fade' | 'ai' | 'reveal'>('fade');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('surprise_message');
    if (stored) {
      setMessage(stored);
    } else {
      setMessage('Chut kab ragdoge mere muh pe?');
    }

    const aiTimer = setTimeout(() => setPhase('ai'), 2000);
    const revealTimer = setTimeout(() => setPhase('reveal'), 6000);

    return () => {
      clearTimeout(aiTimer);
      clearTimeout(revealTimer);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Black overlay fade */}
      <div className="absolute inset-0 bg-black animate-fade-to-black z-10" />

      {/* Content */}
      <div className="relative z-20 text-center px-6 max-w-lg">
        {phase === 'fade' && (
          <div className="animate-fade-in">
            <span className="text-6xl">💘</span>
          </div>
        )}

        {phase === 'ai' && (
          <div className="animate-slide-up space-y-4">
            <span className="text-5xl block mb-4">💝</span>
            <p className="text-white/60 text-lg italic">
              &ldquo;I think 3 years deserves something special…&rdquo;
            </p>
            <p className="text-white/30 text-sm">— Cupid AI</p>
          </div>
        )}

        {phase === 'reveal' && (
          <div className="animate-slide-up space-y-8">
            {/* Hearts background */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-10 left-10 text-4xl opacity-20 animate-float">💕</div>
              <div className="absolute top-20 right-10 text-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>💗</div>
              <div className="absolute bottom-20 left-20 text-5xl opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>✨</div>
              <div className="absolute bottom-10 right-20 text-4xl opacity-20 animate-float" style={{ animationDelay: '1.5s' }}>💘</div>
            </div>

            <span className="text-7xl block animate-float">💖</span>

            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 bg-clip-text text-transparent leading-relaxed">
                {message}
              </h1>
            </div>

            <div className="pt-8">
              <p className="text-white/20 text-xs">
                Made with love, code, and a slightly unhinged AI 💘
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
