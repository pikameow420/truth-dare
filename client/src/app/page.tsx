'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';

export default function Home() {
  const [name, setName] = useState('');
  const [joining, setJoining] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [players, setPlayers] = useState<{ name: string; isAI: boolean }[]>([]);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const socket = getSocket();
    socket.connect();

    socket.on('player_joined', (data: { players: { name: string; isAI: boolean }[] }) => {
      setPlayers(data.players);
    });

    socket.on('game_start', () => {
      router.push('/game');
    });

    socket.on('error_message', (data: { message: string }) => {
      setError(data.message);
      setJoining(false);
      setWaiting(false);
    });

    return () => {
      socket.off('player_joined');
      socket.off('game_start');
      socket.off('error_message');
    };
  }, [router]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setJoining(true);
    setError('');
    const socket = getSocket();
    socket.emit('join_room', { name: name.trim() });
    setWaiting(true);
    setJoining(false);
  };

  const humanPlayers = players.filter((p) => !p.isAI);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background hearts */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-10 animate-float">💕</div>
        <div className="absolute top-40 right-20 text-4xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>💘</div>
        <div className="absolute bottom-32 left-1/4 text-5xl opacity-10 animate-float" style={{ animationDelay: '2s' }}>💗</div>
        <div className="absolute bottom-20 right-1/3 text-3xl opacity-10 animate-float" style={{ animationDelay: '0.5s' }}>✨</div>
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-8 animate-float">
          <span className="text-6xl">💘</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
          Truth or Dare
        </h1>
        <p className="text-white/40 text-sm mb-8">3 Year Edition • Valentine&apos;s Special</p>

        {!waiting ? (
          <form onSubmit={handleJoin} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              maxLength={20}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 text-white text-center text-lg placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all"
              autoFocus
            />
            <button
              type="submit"
              disabled={joining || !name.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl font-semibold text-white text-lg hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed animate-pulse-glow cursor-pointer"
            >
              {joining ? 'Joining...' : 'Join Game 💕'}
            </button>
          </form>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <p className="text-white/60 text-sm mb-4">Players in lobby</p>
              <div className="space-y-2">
                {humanPlayers.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center gap-2 text-white/80"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    <span>{p.name}</span>
                  </div>
                ))}
                {humanPlayers.length < 2 && (
                  <div className="flex items-center justify-center gap-2 text-white/30">
                    <span className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
                    <span>Waiting for player...</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-white/30 text-xs">
              Share this link with your partner to join
            </p>
          </div>
        )}

        {error && (
          <p className="mt-4 text-red-400 text-sm animate-fade-in">{error}</p>
        )}
      </div>
    </div>
  );
}
