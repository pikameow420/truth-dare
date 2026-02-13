'use client';

interface QuestionCardProps {
  question: string;
  answerer: string;
  isDoubleDare?: boolean;
  round: number;
  totalRounds: number;
}

export default function QuestionCard({
  question,
  answerer,
  isDoubleDare,
  round,
  totalRounds,
}: QuestionCardProps) {
  return (
    <div className="animate-slide-up w-full max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-3 px-1">
        <span className="text-xs text-white/40 font-mono">
          Round {round}/{totalRounds}
        </span>
        {isDoubleDare && (
          <span className="text-xs font-bold text-orange-400 animate-pulse">
            🎯 DOUBLE DARE
          </span>
        )}
      </div>

      <div
        className={`
          relative rounded-2xl p-6 backdrop-blur-sm
          ${isDoubleDare
            ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30'
            : 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/20'
          }
        `}
      >
        <p className="text-lg md:text-xl font-medium text-center leading-relaxed">
          {question}
        </p>

        <div className="mt-4 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-sm text-white/70">
            {answerer}&apos;s turn to answer
          </span>
        </div>
      </div>
    </div>
  );
}
