import { STORAGE_KEYS } from '../constants';
import { Session, TimerState, Note } from '../types';

export const getStoredSessions = (): Session[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error loading sessions", e);
    return [];
  }
};

export const saveSession = (session: Session) => {
  const sessions = getStoredSessions();
  const updated = [session, ...sessions];
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
  return updated;
};

export const getStoredTimerState = (): TimerState => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TIMER_STATE);
    return data ? JSON.parse(data) : { isRunning: false, startTime: null, accumulatedTime: 0 };
  } catch (e) {
    return { isRunning: false, startTime: null, accumulatedTime: 0 };
  }
};

export const saveStoredTimerState = (state: TimerState) => {
  localStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify(state));
};

export const getStoredNotesList = (): Note[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTES_LIST);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveStoredNotesList = (notes: Note[]) => {
  localStorage.setItem(STORAGE_KEYS.NOTES_LIST, JSON.stringify(notes));
};