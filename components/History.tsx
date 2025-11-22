import React, { useMemo, useState } from 'react';
import { Session } from '../types';
import { Clock, CalendarDays, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryProps {
  sessions: Session[];
}

const DayGroup: React.FC<{
  dateKey: string;
  sessions: Session[];
  defaultOpen: boolean;
  formatDateHeader: (date: string) => string;
  formatTimeRange: (session: Session) => string;
  formatDuration: (secs: number) => string;
}> = ({ dateKey, sessions, defaultOpen, formatDateHeader, formatTimeRange, formatDuration }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-zinc-200 dark:border-zinc-800/50 rounded-xl overflow-hidden bg-white/20 dark:bg-zinc-900/20 transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/40 dark:hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors ${isOpen ? 'text-emerald-600 dark:text-emerald-500' : ''}`}>
            <CalendarDays className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {formatDateHeader(dateKey)}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-600 font-mono bg-zinc-100 dark:bg-zinc-800/50 px-2 py-0.5 rounded-full">
            {sessions.length}
          </span>
        </div>
        <div className={`text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-2 pt-0 space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-2.5 ml-2 rounded-lg hover:bg-white/40 dark:hover:bg-zinc-800/40 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 group-hover:bg-emerald-500 transition-colors" />
                    <div className="text-zinc-600 dark:text-zinc-400 text-xs font-medium">
                      {formatTimeRange(session)}
                    </div>
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-mono font-medium text-xs bg-emerald-500/5 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                    {formatDuration(session.duration)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const History: React.FC<HistoryProps> = ({ sessions }) => {
  const groupedSessions = useMemo(() => {
    // Sort by newest first and take recent 30 to show more history in dropdowns
    const sorted = [...sessions].sort((a, b) => b.timestamp - a.timestamp).slice(0, 30);

    const groups: { [key: string]: Session[] } = {};

    sorted.forEach(session => {
      const date = new Date(session.timestamp);
      const dateKey = date.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(session);
    });

    return groups;
  }, [sessions]);

  if (Object.keys(groupedSessions).length === 0) return null;

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  const formatTimeRange = (session: Session) => {
    const end = new Date(session.timestamp);
    const start = new Date(session.timestamp - session.duration * 1000);

    const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();

    return `${formatTime(start)} - ${formatTime(end)}`;
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
    <div className="mt-6 border-t border-zinc-200 dark:border-zinc-900 pt-6 transition-colors duration-500 w-full flex flex-col h-full min-h-0">
      <h3 className="text-zinc-400 dark:text-zinc-500 text-sm font-medium mb-4 uppercase tracking-wider flex-shrink-0">Recent Activity</h3>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3 overflow-y-auto min-h-0 flex-1 pr-2"
      >
        {Object.entries(groupedSessions).map(([dateKey, groupSessions], index) => (
          <motion.div key={dateKey} variants={item}>
            <DayGroup
              dateKey={dateKey}
              sessions={groupSessions}
              defaultOpen={index === 0}
              formatDateHeader={formatDateHeader}
              formatTimeRange={formatTimeRange}
              formatDuration={formatDuration}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};