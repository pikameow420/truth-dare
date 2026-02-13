'use client';

interface TimerProps {
  seconds: number;
  maxSeconds: number;
}

export default function Timer({ seconds, maxSeconds }: TimerProps) {
  const percentage = (seconds / maxSeconds) * 100;
  const isUrgent = seconds <= 10;
  const isCritical = seconds <= 5;

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-white/40">Time</span>
        <span
          className={`text-sm font-mono font-bold ${
            isCritical
              ? 'text-red-400 animate-pulse'
              : isUrgent
              ? 'text-orange-400'
              : 'text-white/70'
          }`}
        >
          {seconds}s
        </span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isCritical
              ? 'bg-red-500'
              : isUrgent
              ? 'bg-orange-400'
              : 'bg-gradient-to-r from-pink-500 to-purple-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
