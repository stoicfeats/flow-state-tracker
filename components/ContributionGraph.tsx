import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Session } from '../types';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

interface ContributionGraphProps {
  sessions: Session[];
}

interface TooltipData {
  x: number;
  y: number;
  date: string;
  hours: number;
  count: number;
}

export const ContributionGraph: React.FC<ContributionGraphProps> = ({ sessions }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  useEffect(() => {
    // Using requestAnimationFrame ensures we scroll after layout is fully calculated
    requestAnimationFrame(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
    });
  }, [sessions]);

  const calendarData = useMemo(() => {
    const days = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);

    const sessionMap = new Map<string, number>();
    sessions.forEach(s => {
      const date = new Date(s.timestamp);
      const key = date.toDateString(); 
      sessionMap.set(key, (sessionMap.get(key) || 0) + s.duration);
    });

    for (let i = 0; i < 365; i++) {
      const current = new Date(startDate);
      current.setDate(startDate.getDate() + i);
      const dateKey = current.toDateString();
      const seconds = sessionMap.get(dateKey) || 0;
      
      days.push({
        date: current,
        seconds,
        hours: parseFloat((seconds / 3600).toFixed(1))
      });
    }
    return days;
  }, [sessions]);

  const weeks = useMemo(() => {
    const weeksArray = [];
    let currentWeek: typeof calendarData = [];
    
    calendarData.forEach((day, index) => {
      currentWeek.push(day);
      if (day.date.getDay() === 6 || index === calendarData.length - 1) {
        if (weeksArray.length === 0 && currentWeek.length < 7) {
           const padding = 7 - currentWeek.length;
           const dummy = Array(padding).fill(null);
           currentWeek = [...dummy, ...currentWeek];
        }
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    });
    return weeksArray;
  }, [calendarData]);

  const getColor = (seconds: number) => {
    if (seconds === 0) return 'bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-white/5'; 
    if (seconds < 1800) return 'bg-emerald-200 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800/50'; 
    if (seconds < 7200) return 'bg-emerald-400 dark:bg-emerald-600 border border-emerald-300 dark:border-emerald-500/50'; 
    if (seconds < 14400) return 'bg-emerald-500 dark:bg-emerald-500 border border-emerald-400 dark:border-emerald-400/50'; 
    return 'bg-emerald-600 dark:bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)] dark:shadow-[0_0_10px_rgba(52,211,153,0.6)] border border-emerald-500 dark:border-emerald-300'; 
  };

  const handleMouseEnter = (e: React.MouseEvent, day: typeof calendarData[0]) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top,
      date: day.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'}),
      hours: day.hours,
      count: day.seconds
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[260px] w-full h-full bg-white/60 dark:bg-white/5 rounded-2xl p-4 shadow-lg dark:shadow-2xl backdrop-blur-xl border border-zinc-200 dark:border-white/5 transition-colors duration-500 flex flex-col"
    >
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Consistency Map
        </h3>
        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">Last 365 Days</div>
      </div>
      
      <div 
        ref={scrollRef}
        className="w-full overflow-x-auto pb-2 flex-grow flex items-center touch-pan-x"
        style={{ 
            scrollBehavior: 'auto',
            overscrollBehaviorX: 'contain' 
        }}
      >
        <div className="flex gap-1 min-w-max p-1">
            {weeks.map((week, wIndex) => (
            <div key={wIndex} className="flex flex-col gap-1">
                {week.map((day, dIndex) => {
                if (!day) return <div key={`pad-${dIndex}`} className="w-4 h-4 bg-transparent" />;
                
                return (
                    <motion.div 
                        key={day.date.toISOString()} 
                        className={`w-4 h-4 rounded-sm cursor-pointer transition-all duration-200 hover:opacity-80 hover:scale-110 ${getColor(day.seconds)}`}
                        onMouseEnter={(e) => handleMouseEnter(e, day)}
                        onMouseLeave={handleMouseLeave}
                    />
                )
                })}
            </div>
            ))}
        </div>
      </div>

      {tooltip && createPortal(
        <div 
            className="fixed z-[9999] pointer-events-none transform -translate-x-1/2 -translate-y-full pb-2"
            style={{ left: tooltip.x, top: tooltip.y }}
        >
             <div className="bg-white dark:bg-zinc-950 text-[10px] text-zinc-900 dark:text-white py-1.5 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 whitespace-nowrap shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="font-medium text-zinc-500 dark:text-zinc-300 mb-1">{tooltip.date}</div>
                <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${tooltip.count > 0 ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-zinc-300 dark:bg-zinc-600'}`}></div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">{tooltip.hours}h</span> 
                </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-white dark:bg-zinc-950 border-b border-r border-zinc-200 dark:border-zinc-800 transform rotate-45 translate-y-1"></div>
        </div>,
        document.body
      )}
    </motion.div>
  );
};