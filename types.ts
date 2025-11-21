export interface Session {
  id: string;
  date: string; // ISO Date string
  duration: number; // in seconds
  timestamp: number; // unix timestamp for sorting
}

export interface TimerState {
  isRunning: boolean;
  startTime: number | null; // Timestamp when the current running segment started
  accumulatedTime: number; // Total time in seconds before the current running segment
}

export enum View {
  TRACKER = 'TRACKER',
  NOTES = 'NOTES',
}

export interface StoicQuote {
  text: string;
  author: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}