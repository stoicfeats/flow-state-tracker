import React from 'react';
import { motion } from 'framer-motion';
import { Timer } from './Timer';
import { StoicQuoteBlock } from './StoicQuoteBlock';
import { Stats } from './Stats';
import { ContributionGraph } from './ContributionGraph';
import { History } from './History';
import { DeepWorkInfo } from './DeepWorkInfo';
import { Session } from '../types';

interface TrackerDashboardProps {
  sessions: Session[];
  timerProps: any;
}

export const TrackerDashboard: React.FC<TrackerDashboardProps> = ({ sessions, timerProps }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-stretch pb-6">
        
        {/* Column 1: Stats & Quotes */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-full min-h-0">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/30 dark:bg-white/5 rounded-3xl p-6 border border-zinc-200 dark:border-white/5 backdrop-blur-md flex-shrink-0"
            >
                <h2 className="text-lg font-bold mb-6 text-zinc-800 dark:text-white">Insight</h2>
                <Stats sessions={sessions} layoutMode="dashboard" />
            </motion.div>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/30 dark:bg-white/5 rounded-3xl p-6 border border-zinc-200 dark:border-white/5 backdrop-blur-md flex flex-col items-center justify-center flex-1 min-h-0"
            >
                <StoicQuoteBlock />
            </motion.div>
        </div>

        {/* Column 2: Timer & History */}
        <div className="lg:col-span-5 flex flex-col gap-6 h-full min-h-0">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: "spring" }}
                className="bg-white/40 dark:bg-white/5 rounded-[3rem] p-6 border border-zinc-200 dark:border-white/5 backdrop-blur-xl shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center flex-1 min-h-0 relative overflow-hidden"
            >
                <Timer 
                    {...timerProps}
                    scale={0.85}
                />
            </motion.div>
            <div className="flex-shrink-0 max-h-[35%] overflow-y-auto pr-2">
                <History sessions={sessions} />
            </div>
        </div>

        {/* Column 3: Graph & Info */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full min-h-0">
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 min-h-0 flex flex-col"
            >
                <ContributionGraph sessions={sessions} />
            </motion.div>
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex-1 min-h-0"
            >
                <DeepWorkInfo />
            </motion.div>
        </div>

    </div>
  );
};