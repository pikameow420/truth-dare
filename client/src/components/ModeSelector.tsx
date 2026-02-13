'use client';

type GameMode = 'cute' | 'deep' | 'spicy' | 'future';

interface ModeSelectorProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  disabled?: boolean;
}

const modes: { key: GameMode; label: string; emoji: string; color: string }[] = [
  { key: 'cute', label: 'Cute', emoji: '🥰', color: 'from-pink-400 to-rose-300' },
  { key: 'deep', label: 'Deep', emoji: '🌊', color: 'from-blue-400 to-indigo-400' },
  { key: 'spicy', label: 'Spicy', emoji: '🌶️', color: 'from-orange-400 to-red-500' },
  { key: 'future', label: 'Future', emoji: '✨', color: 'from-purple-400 to-violet-400' },
];

export default function ModeSelector({ currentMode, onModeChange, disabled }: ModeSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {modes.map((mode) => (
        <button
          key={mode.key}
          onClick={() => onModeChange(mode.key)}
          disabled={disabled}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
            ${currentMode === mode.key
              ? `bg-gradient-to-r ${mode.color} text-white shadow-lg scale-105`
              : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {mode.emoji} {mode.label}
        </button>
      ))}
    </div>
  );
}
