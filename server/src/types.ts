export interface Player {
  id: string;
  name: string;
  isAI: boolean;
}

export type GameMode = 'cute' | 'deep' | 'spicy' | 'future';

export interface GameState {
  players: Player[];
  currentMode: GameMode;
  roundCount: number;
  lastQuestions: string[];
  currentQuestion: string | null;
  currentAnswerer: string | null;
  isDoubleDare: boolean;
  doubleDareQuestion: string | null;
  timerSeconds: number;
  gameStarted: boolean;
  gameEnded: boolean;
}

export interface GPTResponse {
  question: string;
  double_dare?: string;
  ai_comment: string;
}

export interface AnswerSubmission {
  answer: string;
}

export interface ReactionPayload {
  emoji: string;
}

export interface ModeChangePayload {
  mode: GameMode;
}

export interface JoinPayload {
  name: string;
}
