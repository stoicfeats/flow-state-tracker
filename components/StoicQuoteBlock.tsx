import React, { useEffect, useState } from 'react';
import { QUOTES } from '../constants';
import { motion } from 'framer-motion';

export const StoicQuoteBlock: React.FC = () => {
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    const random = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(random);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.2 }}
      className="mx-auto max-w-lg text-center"
    >
      <div className="relative inline-block p-4">
        <p className="text-zinc-600 dark:text-zinc-400 font-light text-sm md:text-base italic leading-relaxed transition-colors">
          "{quote.text}"
        </p>
        <p className="text-emerald-600/80 dark:text-emerald-600/80 text-xs font-bold uppercase tracking-widest mt-2">
            — {quote.author}
        </p>
      </div>
    </motion.div>
  );
};