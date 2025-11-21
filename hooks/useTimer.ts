import { useState, useEffect, useRef, useCallback } from 'react';
import { getStoredTimerState, saveStoredTimerState } from '../services/storage';

export const useTimer = () => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);

  useEffect(() => {
    const stored = getStoredTimerState();
    setIsRunning(stored.isRunning);
    startTimeRef.current = stored.startTime;
    accumulatedTimeRef.current = stored.accumulatedTime;
    
    if (stored.isRunning && stored.startTime) {
      const now = Date.now();
      const diff = Math.floor((now - stored.startTime) / 1000);
      setElapsedTime(stored.accumulatedTime + diff);
    } else {
      setElapsedTime(stored.accumulatedTime);
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = window.setInterval(() => {
        const now = Date.now();
        if (startTimeRef.current) {
          const currentSessionDuration = Math.floor((now - startTimeRef.current) / 1000);
          setElapsedTime(accumulatedTimeRef.current + currentSessionDuration);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const persistState = useCallback((running: boolean, start: number | null, accumulated: number) => {
    saveStoredTimerState({
      isRunning: running,
      startTime: start,
      accumulatedTime: accumulated
    });
  }, []);

  const startTimer = () => {
    if (!isRunning) {
      const now = Date.now();
      setIsRunning(true);
      startTimeRef.current = now;
      persistState(true, now, elapsedTime);
    }
  };

  const pauseTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      accumulatedTimeRef.current = elapsedTime; 
      startTimeRef.current = null;
      persistState(false, null, elapsedTime);
    }
  };

  const stopTimer = () => {
    const finalTime = elapsedTime;
    setIsRunning(false);
    setElapsedTime(0);
    accumulatedTimeRef.current = 0;
    startTimeRef.current = null;
    persistState(false, null, 0);
    return finalTime;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setElapsedTime(0);
    accumulatedTimeRef.current = 0;
    startTimeRef.current = null;
    persistState(false, null, 0);
  };

  return {
    elapsedTime,
    isRunning,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer
  };
};