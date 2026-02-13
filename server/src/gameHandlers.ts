import { Server, Socket } from 'socket.io';
import {
  GameState,
  GameMode,
  Player,
  JoinPayload,
  AnswerSubmission,
  ReactionPayload,
  ModeChangePayload,
} from './types';
import { generateQuestion, generateAIAnswer, generateAIReaction } from './openai';

const TOTAL_ROUNDS = 20;
const NORMAL_TIMER = 60;
const DOUBLE_DARE_TIMER = 30;
const DOUBLE_DARE_CHANCE = 0.2;
const AI_ANSWER_INTERVAL = 4;

const SURPRISE_MESSAGE = 'Chut kab ragdoge mere muh pe?';

const gameState: GameState = {
  players: [],
  currentMode: 'cute',
  roundCount: 0,
  lastQuestions: [],
  currentQuestion: null,
  currentAnswerer: null,
  isDoubleDare: false,
  doubleDareQuestion: null,
  timerSeconds: NORMAL_TIMER,
  gameStarted: false,
  gameEnded: false,
};

let timerInterval: NodeJS.Timeout | null = null;

function getHumanPlayers(): Player[] {
  return gameState.players.filter((p) => !p.isAI);
}

function getRandomHumanPlayer(): Player | null {
  const humans = getHumanPlayers();
  if (humans.length === 0) return null;
  return humans[Math.floor(Math.random() * humans.length)];
}

function clearTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function startTimer(io: Server, seconds: number, onExpire: () => void) {
  clearTimer();
  gameState.timerSeconds = seconds;
  io.emit('timer_update', { seconds: gameState.timerSeconds });

  timerInterval = setInterval(() => {
    gameState.timerSeconds--;
    io.emit('timer_update', { seconds: gameState.timerSeconds });

    if (gameState.timerSeconds <= 0) {
      clearTimer();
      onExpire();
    }
  }, 1000);
}

async function startNewRound(io: Server) {
  if (gameState.gameEnded) return;

  gameState.roundCount++;

  if (gameState.roundCount > TOTAL_ROUNDS) {
    endGame(io);
    return;
  }

  gameState.isDoubleDare = false;
  gameState.doubleDareQuestion = null;

  const isAIAnswerRound = gameState.roundCount % AI_ANSWER_INTERVAL === 0;

  const gptResponse = await generateQuestion(gameState.currentMode, gameState.lastQuestions);

  gameState.currentQuestion = gptResponse.question;
  gameState.lastQuestions.push(gptResponse.question);
  if (gameState.lastQuestions.length > 5) {
    gameState.lastQuestions.shift();
  }

  let answerer: Player;
  if (isAIAnswerRound) {
    const aiPlayer = gameState.players.find((p) => p.isAI);
    answerer = aiPlayer!;
  } else {
    answerer = getRandomHumanPlayer()!;
  }
  gameState.currentAnswerer = answerer.id;

  io.emit('new_question', {
    question: gptResponse.question,
    answerer: answerer.name,
    answererId: answerer.id,
    mode: gameState.currentMode,
    round: gameState.roundCount,
    totalRounds: TOTAL_ROUNDS,
    isAIAnswering: answerer.isAI,
  });

  if (gptResponse.ai_comment) {
    io.emit('ai_message', {
      message: gptResponse.ai_comment,
      type: 'comment',
    });
  }

  if (isAIAnswerRound && answerer.isAI) {
    setTimeout(async () => {
      const aiAnswer = await generateAIAnswer(gptResponse.question, gameState.currentMode);
      io.emit('answer_submitted', {
        player: answerer.name,
        playerId: answerer.id,
        answer: aiAnswer,
        isAI: true,
      });

      startTimer(io, 10, () => {
        io.emit('ai_message', {
          message: "Time's up! Let's keep it moving 💨",
          type: 'system',
        });
      });
    }, 3000);
  } else {
    const hasDoubleDare = gptResponse.double_dare || Math.random() < DOUBLE_DARE_CHANCE;
    if (hasDoubleDare && gptResponse.double_dare) {
      gameState.doubleDareQuestion = gptResponse.double_dare;
    }

    startTimer(io, NORMAL_TIMER, () => {
      io.emit('ai_message', {
        message: `⏰ Time's up! ${answerer.name} couldn't handle the heat 🔥`,
        type: 'system',
      });
    });
  }
}

function endGame(io: Server) {
  clearTimer();
  gameState.gameEnded = true;

  io.emit('ai_message', {
    message: "I think 3 years deserves something special… 💝",
    type: 'farewell',
  });

  setTimeout(() => {
    io.emit('game_end', {
      message: SURPRISE_MESSAGE,
    });
  }, 3000);
}

export function setupGameHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join_room', (payload: JoinPayload) => {
      const existingHumans = getHumanPlayers();
      if (existingHumans.length >= 2) {
        socket.emit('error_message', { message: 'Game is full!' });
        return;
      }

      const alreadyJoined = gameState.players.find((p) => p.id === socket.id);
      if (alreadyJoined) return;

      const player: Player = {
        id: socket.id,
        name: payload.name,
        isAI: false,
      };
      gameState.players.push(player);

      io.emit('player_joined', {
        players: gameState.players.map((p) => ({ name: p.name, isAI: p.isAI })),
      });

      console.log(`${payload.name} joined. Players: ${gameState.players.length}`);

      if (getHumanPlayers().length === 2 && !gameState.gameStarted) {
        if (!gameState.players.find((p) => p.isAI)) {
          gameState.players.push({
            id: 'cupid-ai',
            name: 'Cupid AI',
            isAI: true,
          });
        }

        io.emit('player_joined', {
          players: gameState.players.map((p) => ({ name: p.name, isAI: p.isAI })),
        });

        gameState.gameStarted = true;

        setTimeout(() => {
          io.emit('game_start', {});
          io.emit('ai_message', {
            message: "Hey lovebirds! 💘 I'm Cupid AI, your third wheel for tonight. 3 years together? Let's see how well you really know each other… 😏",
            type: 'intro',
          });

          setTimeout(() => {
            startNewRound(io);
          }, 3000);
        }, 2000);
      }
    });

    socket.on('submit_answer', async (payload: AnswerSubmission) => {
      const player = gameState.players.find((p) => p.id === socket.id);
      if (!player) return;

      clearTimer();

      io.emit('answer_submitted', {
        player: player.name,
        playerId: player.id,
        answer: payload.answer,
        isAI: false,
      });

      if (gameState.currentQuestion) {
        const reaction = await generateAIReaction(
          gameState.currentQuestion,
          payload.answer,
          player.name
        );
        io.emit('ai_message', {
          message: reaction,
          type: 'reaction',
        });
      }

      if (gameState.doubleDareQuestion && !gameState.isDoubleDare) {
        gameState.isDoubleDare = true;
        setTimeout(() => {
          io.emit('double_dare', {
            question: gameState.doubleDareQuestion,
          });
          io.emit('ai_message', {
            message: "🎯 DOUBLE DARE! You can't skip this one… 😈",
            type: 'dare',
          });
          startTimer(io, DOUBLE_DARE_TIMER, () => {
            io.emit('ai_message', {
              message: "Too slow! The dare stands unanswered… for now 👀",
              type: 'system',
            });
          });
        }, 2000);
      }
    });

    socket.on('send_reaction', (payload: ReactionPayload) => {
      const player = gameState.players.find((p) => p.id === socket.id);
      if (!player) return;

      socket.broadcast.emit('reaction', {
        emoji: payload.emoji,
        from: player.name,
      });
    });

    socket.on('change_mode', (payload: ModeChangePayload) => {
      gameState.currentMode = payload.mode;
      io.emit('mode_changed', { mode: payload.mode });
      io.emit('ai_message', {
        message: getModeChangeComment(payload.mode),
        type: 'system',
      });
    });

    socket.on('next_round', () => {
      clearTimer();
      startNewRound(io);
    });

    socket.on('trigger_end', () => {
      endGame(io);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      const idx = gameState.players.findIndex((p) => p.id === socket.id);
      if (idx !== -1) {
        const player = gameState.players[idx];
        gameState.players.splice(idx, 1);
        io.emit('player_joined', {
          players: gameState.players.map((p) => ({ name: p.name, isAI: p.isAI })),
        });
        io.emit('ai_message', {
          message: `${player.name} left the game 😢`,
          type: 'system',
        });
      }
    });

    socket.on('reset_game', () => {
      clearTimer();
      gameState.players = [];
      gameState.currentMode = 'cute';
      gameState.roundCount = 0;
      gameState.lastQuestions = [];
      gameState.currentQuestion = null;
      gameState.currentAnswerer = null;
      gameState.isDoubleDare = false;
      gameState.doubleDareQuestion = null;
      gameState.timerSeconds = NORMAL_TIMER;
      gameState.gameStarted = false;
      gameState.gameEnded = false;
      io.emit('game_reset', {});
      console.log('Game reset');
    });
  });
}

function getModeChangeComment(mode: GameMode): string {
  const comments: Record<GameMode, string> = {
    cute: "Switching to Cute mode 🥰 Time for the wholesome stuff!",
    deep: "Deep mode activated 🌊 Things are about to get real…",
    spicy: "Ooh, Spicy mode 🌶️ I love where this is going…",
    future: "Future mode ✨ Let's manifest some things together!",
  };
  return comments[mode];
}
