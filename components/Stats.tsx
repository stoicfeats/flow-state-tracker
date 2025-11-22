import React, { useMemo } from 'react';
import { Session } from '../types';
import { Flame, Trophy, Clock, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsProps {
  sessions: Session[];
  layoutMode?: 'standard' | 'dashboard';
}

export const Stats: React.FC<StatsProps> = ({ sessions, layoutMode = 'standard' }) => {
  const stats = useMemo(() => {
    if (sessions.length === 0) return { currentStreak: 0, longestStreak: 0, totalHours: 0, todayHours: 0 };

    const totalSeconds = sessions.reduce((acc, curr) => acc + curr.duration, 0);
    const totalHours = parseFloat((totalSeconds / 3600).toFixed(1));

    const uniqueDaysMap = new Map<string, number>();

    sessions.forEach(s => {
      const date = new Date(s.timestamp);
      const key = date.toLocaleDateString();
      if (!uniqueDaysMap.has(key)) {
        uniqueDaysMap.set(key, date.setHours(12, 0, 0, 0));
      }
    });

    const sortedTimestamps = Array.from(uniqueDaysMap.values()).sort((a, b) => a - b);

    let maxStreak = 0;
    let currentStreakCount = 0;
    let tempStreak = 0;

    for (let i = 0; i < sortedTimestamps.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = sortedTimestamps[i - 1];
        const curr = sortedTimestamps[i];
        const diffTime = Math.abs(curr - prev);
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      maxStreak = Math.max(maxStreak, tempStreak);
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastDateTimestamp = sortedTimestamps[sortedTimestamps.length - 1];
    const lastDate = new Date(lastDateTimestamp);

    const isToday = lastDate.toLocaleDateString() === today.toLocaleDateString();
    const isYesterday = lastDate.toLocaleDateString() === yesterday.toLocaleDateString();

    if (isToday || isYesterday) {
      currentStreakCount = tempStreak;
    } else {
      currentStreakCount = 0;
    }

    const todaySeconds = sessions
      .filter(s => new Date(s.timestamp).toDateString() === new Date().toDateString())
      .reduce((acc, curr) => acc + curr.duration, 0);
    const todayHours = parseFloat((todaySeconds / 3600).toFixed(1));

    return { currentStreak: currentStreakCount, longestStreak: maxStreak, totalHours, todayHours };
  }, [sessions]);

  return (
    <div className={`grid ${layoutMode === 'dashboard' ? 'grid-cols-2 gap-4' : 'grid-cols-2 md:grid-cols-4 gap-4 mb-8'}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg transition-colors duration-500 group hover:border-emerald-500/30"
      >
        <Flame className="w-5 h-5 text-orange-500 dark:text-orange-400 mb-2 transition-transform group-hover:scale-110 duration-300" />
        <div className="text-3xl font-light text-zinc-900 dark:text-white tabular-nums">{stats.currentStreak}</div>
        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">Cur. Streak</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg transition-colors duration-500 group hover:border-yellow-500/30"
      >
        <Trophy className="w-5 h-5 text-yellow-500 dark:text-yellow-400 mb-2 transition-transform group-hover:scale-110 duration-300" />
        <div className="text-3xl font-light text-zinc-900 dark:text-white tabular-nums">{stats.longestStreak}</div>
        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">Best Streak</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg transition-colors duration-500 group hover:border-emerald-500/30"
      >
        <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2 transition-transform group-hover:scale-110 duration-300" />
        <div className="text-3xl font-light text-zinc-900 dark:text-white tabular-nums">{stats.totalHours}</div>
        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">Total Hours</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg transition-colors duration-500 group hover:border-purple-500/30"
      >
        <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2 transition-transform group-hover:scale-110 duration-300" />
        <div className="text-3xl font-light text-zinc-900 dark:text-white tabular-nums">{stats.todayHours}</div>
        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">Today's Focus</div>
      </motion.div>
    </div>
  );
};