'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import ModeSelector from '@/components/ModeSelector';
import QuestionCard from '@/components/QuestionCard';
import Timer from '@/components/Timer';
import AnswerInput from '@/components/AnswerInput';
import ReactionButtons from '@/components/ReactionButtons';
import AIChatBubble from '@/components/AIChatBubble';

type GameMode = 'cute' | 'deep' | 'spicy' | 'future';

interface QuestionData {
  question: string;
  answerer: string;
  answererId: string;
  mode: GameMode;
  round: number;
  totalRounds: number;
  isAIAnswering: boolean;
}

interface AnswerData {
  player: string;
  playerId: string;
  answer: string;
  isAI: boolean;
}

interface AIMessage {
  message: string;
  type: string;
  id: number;
}

interface ReactionData {
  emoji: string;
  from: string;
}

export default function GamePage() {
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState<GameMode>('cute');
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [maxTimer, setMaxTimer] = useState(60);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [lastAnswer, setLastAnswer] = useState<AnswerData | null>(null);
  const [isDoubleDare, setIsDoubleDare] = useState(false);
  const [doubleDareQuestion, setDoubleDareQuestion] = useState<string | null>(null);
  const [floatingReaction, setFloatingReaction] = useState<ReactionData | null>(null);
  const [answered, setAnswered] = useState(false);
  const [msgCounter, setMsgCounter] = useState(0);

  const socket = getSocket();
  const myId = socket.id;

  const addAIMessage = useCallback((message: string, type: string) => {
    setMsgCounter((prev) => {
      const newId = prev + 1;
      setAiMessages((msgs) => [...msgs, { message, type, id: newId }]);
      return newId;
    });
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      router.push('/');
      return;
    }

    socket.on('new_question', (data: QuestionData) => {
      setQuestionData(data);
      setLastAnswer(null);
      setAnswered(false);
      setIsDoubleDare(false);
      setDoubleDareQuestion(null);
      setMaxTimer(60);
      setTimerSeconds(60);
    });

    socket.on('timer_update', (data: { seconds: number }) => {
      setTimerSeconds(data.seconds);
    });

    socket.on('answer_submitted', (data: AnswerData) => {
      setLastAnswer(data);
      setAnswered(true);
    });

    socket.on('ai_message', (data: { message: string; type: string }) => {
      addAIMessage(data.message, data.type);
    });

    socket.on('double_dare', (data: { question: string }) => {
      setIsDoubleDare(true);
      setDoubleDareQuestion(data.question);
      setMaxTimer(30);
      setTimerSeconds(30);
      setAnswered(false);
      setLastAnswer(null);
    });

    socket.on('mode_changed', (data: { mode: GameMode }) => {
      setCurrentMode(data.mode);
    });

    socket.on('reaction', (data: ReactionData) => {
      setFloatingReaction(data);
      setTimeout(() => setFloatingReaction(null), 2000);
    });

    socket.on('game_end', (data: { message: string }) => {
      sessionStorage.setItem('surprise_message', data.message);
      router.push('/end');
    });

    return () => {
      socket.off('new_question');
      socket.off('timer_update');
      socket.off('answer_submitted');
      socket.off('ai_message');
      socket.off('double_dare');
      socket.off('mode_changed');
      socket.off('reaction');
      socket.off('game_end');
    };
  }, [socket, router, addAIMessage]);

  const handleModeChange = (mode: GameMode) => {
    socket.emit('change_mode', { mode });
  };

  const handleSubmitAnswer = (answer: string) => {
    socket.emit('submit_answer', { answer });
  };

  const handleReaction = (emoji: string) => {
    socket.emit('send_reaction', { emoji });
  };

  const handleNextRound = () => {
    socket.emit('next_round');
  };

  const isMyTurn = questionData?.answererId === myId;
  const displayQuestion = isDoubleDare && doubleDareQuestion ? doubleDareQuestion : questionData?.question;

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 relative">
      {/* Floating reaction */}
      {floatingReaction && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="text-7xl animate-float opacity-80">
            {floatingReaction.emoji}
          </div>
          <p className="text-center text-white/50 text-xs mt-2">{floatingReaction.from}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <h2 className="text-sm font-medium text-white/30">
          💘 Truth or Dare — 3 Year Edition
        </h2>
        <ModeSelector
          currentMode={currentMode}
          onModeChange={handleModeChange}
          disabled={false}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-2xl mx-auto w-full">
        {/* Question */}
        {displayQuestion && questionData ? (
          <>
            <QuestionCard
              question={displayQuestion}
              answerer={questionData.answerer}
              isDoubleDare={isDoubleDare}
              round={questionData.round}
              totalRounds={questionData.totalRounds}
            />

            {/* Timer */}
            <Timer seconds={timerSeconds} maxSeconds={maxTimer} />

            {/* Answer area */}
            {!answered ? (
              questionData.isAIAnswering ? (
                <div className="text-center py-4 animate-fade-in">
                  <p className="text-white/40 text-sm italic">
                    Cupid AI is thinking... 🤔
                  </p>
                </div>
              ) : (
                <AnswerInput
                  onSubmit={handleSubmitAnswer}
                  isMyTurn={isMyTurn}
                  disabled={answered}
                />
              )
            ) : (
              <div className="w-full max-w-lg mx-auto space-y-4 animate-fade-in">
                {lastAnswer && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-xs text-white/40 mb-1">
                      {lastAnswer.player}&apos;s answer {lastAnswer.isAI && '🤖'}
                    </p>
                    <p className="text-white/90">{lastAnswer.answer}</p>
                  </div>
                )}

                {/* Reactions (for non-answerer) */}
                {!isMyTurn && !questionData.isAIAnswering && (
                  <ReactionButtons onReaction={handleReaction} />
                )}

                {/* Next round button */}
                <div className="text-center pt-2">
                  <button
                    onClick={handleNextRound}
                    className="px-8 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white/70 hover:text-white transition-all text-sm font-medium cursor-pointer"
                  >
                    Next Round →
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center animate-pulse">
            <p className="text-white/30">Getting things ready...</p>
          </div>
        )}
      </div>

      {/* AI Chat Feed */}
      <div className="mt-6 pb-4">
        <AIChatBubble messages={aiMessages} />
      </div>
    </div>
  );
}
