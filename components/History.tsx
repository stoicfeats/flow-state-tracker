import React from 'react';
import { Session } from '../types';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface HistoryProps {
  sessions: Session[];
}

export const History: React.FC<HistoryProps> = ({ sessions }) => {
  const recent = [...sessions].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

  if (recent.length === 0) return null;

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="mt-10 border-t border-zinc-200 dark:border-zinc-900 pt-8 transition-colors duration-500 w-full">
      <h3 className="text-zinc-400 dark:text-zinc-500 text-sm font-medium mb-4 uppercase tracking-wider">Recent Sessions</h3>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {recent.map((session) => (
          <motion.div
            key={session.id}
            variants={item}
            className="flex items-center justify-between p-3 bg-white/40 dark:bg-zinc-900/30 rounded-lg border border-zinc-200 dark:border-zinc-800/50 hover:bg-white/60 dark:hover:bg-zinc-900/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-zinc-800 dark:text-zinc-200 text-sm font-medium">{new Date(session.timestamp).toLocaleDateString()}</div>
                <div className="text-zinc-400 dark:text-zinc-500 text-xs">
                  {new Date(session.timestamp - session.duration * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase()} - {new Date(session.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase()}
                </div>
              </div>
            </div>
            <div className="text-emerald-600 dark:text-emerald-400 font-mono font-medium text-sm">
              {formatDuration(session.duration)}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};