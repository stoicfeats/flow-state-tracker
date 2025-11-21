import React from 'react';
import { Brain, Zap, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';

export const DeepWorkInfo: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="h-full flex flex-col gap-4"
    >
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-lg">
            <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
                <Brain className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest">What is Deep Work?</h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Deep work is the ability to focus without distraction on a cognitively demanding task. It's a skill that allows you to quickly master complicated information and produce better results in less time.
            </p>
        </div>

        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-lg flex-1">
            <div className="flex items-center gap-2 mb-2 text-amber-500 dark:text-amber-400">
                <Zap className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest">Why 90 Minutes?</h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
                Research suggests our brains operate in "ultradian cycles" of about 90 minutes. Focusing for this duration aligns with your body's natural rhythm, maximizing alertness before fatigue sets in.
            </p>
            <div className="flex items-start gap-2 mt-2 text-[10px] text-zinc-500 dark:text-zinc-500 border-t border-zinc-200 dark:border-white/5 pt-2">
                <Coffee className="w-3 h-3 mt-0.5" />
                <span>Tip: Take a real break after a session. Walk, stretch, or hydrate to reset your attention capital.</span>
            </div>
        </div>
    </motion.div>
  );
};