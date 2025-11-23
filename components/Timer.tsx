import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playTimerFinishedSound } from '../utils/sound';

interface TimerProps {
  elapsedSeconds: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
  scale?: number;
  targetMinutes: number;
  setTargetMinutes: (min: number) => void;
}

export const Timer: React.FC<TimerProps> = ({
  elapsedSeconds,
  isRunning,
  onStart,
  onPause,
  onStop,
  onReset,
  scale = 1,
  targetMinutes,
  setTargetMinutes
}) => {

  const [isCustomInput, setIsCustomInput] = useState(false);
  const [customInputValue, setCustomInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);



  useEffect(() => {
    if (isRunning && elapsedSeconds >= targetMinutes * 60) {
      playTimerFinishedSound();
      onStop();
    }
  }, [elapsedSeconds, targetMinutes, isRunning, onStop]);

  useEffect(() => {
    if (isCustomInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCustomInput]);

  const getRadius = (minutes: number) => {
    if (minutes <= 15) return 110;
    if (minutes <= 30) return 130;
    if (minutes <= 45) return 150;
    return 165;
  };

  const radius = getRadius(targetMinutes);
  const circumference = 2 * Math.PI * radius;

  const targetSeconds = targetMinutes * 60;
  const progress = Math.min(elapsedSeconds / targetSeconds, 1);
  const dashOffset = circumference - progress * circumference;

  const dynamicFontSize = Math.max(2.5, radius / 32);

  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;

    if (hrs > 0) {
      return (
        <>
          <span className="text-zinc-900 dark:text-white transition-colors">{hrs}</span>
          <span className="text-zinc-300 dark:text-zinc-700 mx-1 transition-colors">:</span>
          <span className="text-zinc-900 dark:text-white transition-colors">{mins.toString().padStart(2, '0')}</span>
          <span className="text-zinc-300 dark:text-zinc-700 mx-1 transition-colors">:</span>
          <span className="text-zinc-400 dark:text-zinc-500 text-[0.5em] transition-colors">{s.toString().padStart(2, '0')}</span>
        </>
      )
    }
    return (
      <>
        <span className="text-zinc-900 dark:text-white transition-colors">{mins.toString().padStart(2, '0')}</span>
        <span className="text-zinc-300 dark:text-zinc-700 mx-1 transition-colors">:</span>
        <span className="text-zinc-900 dark:text-white transition-colors">{s.toString().padStart(2, '0')}</span>
      </>
    );
  };

  const handleCustomSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const val = parseInt(customInputValue);
    if (!isNaN(val) && val > 0) {
      setTargetMinutes(Math.min(val, 240));
    }
    setIsCustomInput(false);
    setCustomInputValue('');
  };

  const presets = [15, 30, 45, 60];

  return (
    <div
      className="flex flex-col items-center justify-center py-4 relative z-10 transition-transform duration-500 origin-center"
      style={{ transform: `scale(${scale})` }}
    >

      <div className="flex items-center gap-2 mb-8 h-8 mt-12 md:mt-0">
        {presets.map(min => (
          <button
            key={min}
            onClick={() => {
              setTargetMinutes(min);
              setIsCustomInput(false);
            }}
            className={`
                    px-4 py-1 rounded-full text-xs font-medium transition-all duration-300 border h-[26px] flex items-center
                    ${targetMinutes === min && !isCustomInput
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/50'
                : 'bg-transparent text-zinc-400 dark:text-zinc-600 border-transparent hover:bg-white/50 dark:hover:bg-white/5 hover:text-zinc-700 dark:hover:text-zinc-300'}
                `}
          >
            {min}m
          </button>
        ))}

        <div className="relative flex items-center">
          <AnimatePresence mode='wait'>
            {isCustomInput ? (
              <motion.form
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 80, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                onSubmit={handleCustomSubmit}
                className="overflow-hidden h-[26px] flex items-center"
              >
                <input
                  ref={inputRef}
                  type="number"
                  min="1"
                  max="240"
                  value={customInputValue}
                  onChange={(e) => setCustomInputValue(e.target.value)}
                  onBlur={handleCustomSubmit}
                  className="w-full px-2 h-full rounded-full text-xs bg-white/10 dark:bg-white/5 border border-emerald-500/50 text-zinc-900 dark:text-white outline-none text-center"
                  placeholder="min"
                />
              </motion.form>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCustomInput(true)}
                className={`px-4 py-1 rounded-full text-xs font-medium transition-all duration-300 border h-[26px] flex items-center ${!presets.includes(targetMinutes) ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/50' : 'bg-transparent text-zinc-400 dark:text-zinc-600 border-transparent hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              >
                {!presets.includes(targetMinutes) ? `${targetMinutes}m` : 'Custom'}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

      </div>

      <div className="relative flex items-center justify-center mb-1">
        <svg className="w-[360px] h-[360px] md:w-[400px] md:h-[400px] transform -rotate-90 drop-shadow-2xl overflow-visible">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <motion.circle
            cx="50%"
            cy="50%"
            animate={{ r: radius }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            fill="transparent"
            className="stroke-zinc-200 dark:stroke-zinc-800/40 transition-colors duration-500"
            strokeWidth="1.5"
          />

          <motion.circle
            cx="50%"
            cy="50%"
            animate={{
              r: radius,
              strokeDashoffset: dashOffset,
              stroke: isRunning ? "#10b981" : "currentColor"
            }}
            transition={{
              r: { type: "spring", stiffness: 100, damping: 20 },
              strokeDashoffset: { duration: 0.5, ease: "linear" },
              stroke: { duration: 0.3 }
            }}
            fill="transparent"
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeLinecap="round"
            className={`ease-linear ${isRunning ? '' : 'text-zinc-300 dark:text-zinc-700'}`}
            filter={isRunning ? "url(#glow)" : ""}
            style={{
              opacity: isRunning || elapsedSeconds > 0 ? 1 : 0.3,
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-500">
          <div
            className="font-thin font-sans tracking-tighter tabular-nums flex items-baseline transition-all duration-500 ease-out text-zinc-900 dark:text-white"
            style={{ fontSize: `${dynamicFontSize}rem` }}
          >
            {formatTime(elapsedSeconds)}
          </div>
          <div
            className={`font-bold tracking-[0.4em] mt-4 uppercase transition-colors duration-300 ${isRunning ? 'text-emerald-500 dark:text-emerald-400 animate-pulse' : 'text-zinc-400 dark:text-zinc-600'}`}
            style={{ fontSize: '0.75rem' }}
          >
            {isRunning ? 'Flow State' : 'Focus'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {!isRunning && elapsedSeconds === 0 && (
          <button
            onClick={onStart}
            className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 transition-all hover:scale-105 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
          >
            <Play className="w-6 h-6 text-white dark:text-black fill-current ml-1" />
          </button>
        )}

        {!isRunning && elapsedSeconds > 0 && (
          <>
            <button
              onClick={onReset}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-all"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onStart}
              className="w-16 h-16 flex items-center justify-center rounded-full bg-emerald-500 text-white dark:text-black hover:bg-emerald-400 transition-all hover:scale-105 shadow-lg shadow-emerald-900/20"
            >
              <Play className="w-6 h-6 fill-current ml-1" />
            </button>

            <button
              onClick={onStop}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/30 transition-all"
              title="Finish Session"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          </>
        )}

        {isRunning && (
          <button
            onClick={onPause}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
          >
            <Pause className="w-6 h-6 fill-current" />
          </button>
        )}
      </div>

    </div>
  );
};