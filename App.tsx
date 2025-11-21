import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  NotebookPen,
  Sun,
  Moon,
  Columns,
  Rows
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrackerStandard } from './components/TrackerStandard';
import { TrackerDashboard } from './components/TrackerDashboard';
import { Notes } from './components/Notes';
import { useTimer } from './hooks/useTimer';
import { getStoredSessions, saveSession } from './services/storage';
import { Session, View } from './types';
import { STORAGE_KEYS } from './constants';

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

const Logo3D = () => (
  <div className="relative w-10 h-10 flex items-center justify-center">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
      <path d="M20 2L37.3205 12V32L20 42L2.67949 32V12L20 2Z" fill="url(#logo-gradient-dark)" className="dark:block hidden" />
      <path d="M20 2L37.3205 12V32L20 42L2.67949 32V12L20 2Z" fill="url(#logo-gradient-light)" className="dark:hidden block" />

      <path d="M20 2L37.3205 12V32L20 42L2.67949 32V12L20 2Z" stroke="url(#stroke-gradient)" strokeWidth="0.5" className="opacity-50" />

      <path d="M20 8L32 15L20 22L8 15L20 8Z" fill="white" fillOpacity="0.2" />
      <path d="M20 22L32 15V29L20 36V22Z" fill="black" fillOpacity="0.2" />
      <path d="M20 22L8 15V29L20 36V22Z" fill="black" fillOpacity="0.1" />

      <defs>
        <linearGradient id="logo-gradient-dark" x1="20" y1="2" x2="20" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="logo-gradient-light" x1="20" y1="2" x2="20" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="stroke-gradient" x1="2" y1="2" x2="38" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.8" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.TRACKER);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [layoutMode, setLayoutMode] = useState<'standard' | 'dashboard'>('standard');

  const {
    elapsedTime,
    isRunning,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer
  } = useTimer();

  const [targetMinutes, setTargetMinutes] = useState(30);

  useEffect(() => {
    setSessions(getStoredSessions());

    const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as 'dark' | 'light' | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }

    // Initial layout check: Default to dashboard on web (lg screens)
    if (window.innerWidth >= 1024) {
      setLayoutMode('dashboard');
    } else {
      setLayoutMode('standard');
    }

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setLayoutMode('standard');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleLayout = () => {
    setLayoutMode(prev => prev === 'standard' ? 'dashboard' : 'standard');
  }

  const handleViewChange = (view: View) => {
    setActiveView(view);
  };

  const handleStop = () => {
    const duration = stopTimer();
    if (duration > 10) {
      const newSession: Session = {
        id: generateId(),
        date: new Date().toISOString(),
        duration: duration,
        timestamp: Date.now(),
      };
      const updated = saveSession(newSession);
      setSessions(updated);
    } else {
      resetTimer();
    }
  };

  const timerProps = {
    elapsedSeconds: elapsedTime,
    isRunning: isRunning,
    onStart: startTimer,
    onPause: pauseTimer,
    onStop: handleStop,
    onReset: resetTimer,
    targetMinutes,
    setTargetMinutes
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  const direction = activeView === View.NOTES ? 1 : -1;

  // When in Dashboard mode (Desktop), we want to prevent the main body scroll
  // so the dashboard fits exactly on screen.
  // In Standard mode or Mobile, we want scrolling.
  const isDashboard = layoutMode === 'dashboard' && activeView === View.TRACKER;

  return (
    <div className={`relative h-screen font-sans selection:bg-emerald-500/30 ${isDashboard ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}`}>

      {/* Background Layer - Light Mode */}
      <motion.div
        initial={false}
        animate={{ opacity: theme === 'light' ? 1 : 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className="fixed inset-0 z-0 bg-gradient-to-br from-zinc-50 to-zinc-200 pointer-events-none"
      />

      {/* Background Layer - Dark Mode */}
      <motion.div
        initial={false}
        animate={{ opacity: theme === 'dark' ? 1 : 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className="fixed inset-0 z-0 bg-gradient-to-br from-[#050505] to-zinc-950 pointer-events-none"
      />

      {/* Ambient Glow Overlay */}
      <div className="fixed top-0 left-0 right-0 h-[500px] z-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none transition-colors duration-700"></div>

      <header className="hidden md:flex items-center justify-between px-12 py-6 border-b border-zinc-200/50 dark:border-white/5 backdrop-blur-md sticky top-0 z-50 bg-white/30 dark:bg-black/20 transition-colors duration-500 h-[88px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLayout}
              className="hidden lg:block p-2 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400 transition-colors"
              title="Toggle Layout"
            >
              {layoutMode === 'standard' ? <Columns className="w-5 h-5" /> : <Rows className="w-5 h-5" />}
            </button>
            <Logo3D />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-800 dark:text-white/90 transition-colors duration-500">Flow State Tracker</span>
        </div>

        <div className="flex items-center gap-6">
          <nav className="relative flex bg-zinc-200/50 dark:bg-white/5 p-1 rounded-full border border-zinc-200 dark:border-white/5 backdrop-blur-xl transition-colors duration-500">
            <div
              className={`absolute top-1 bottom-1 w-[100px] rounded-full bg-white dark:bg-zinc-800 shadow-sm transition-all duration-500 ease-out border border-zinc-200 dark:border-white/5`}
              style={{
                left: activeView === View.TRACKER ? '4px' : '104px'
              }}
            />

            <button
              onClick={() => handleViewChange(View.TRACKER)}
              className={`relative z-10 w-[100px] py-1.5 rounded-full text-sm font-medium transition-colors duration-300 ${activeView === View.TRACKER ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              Tracker
            </button>
            <button
              onClick={() => handleViewChange(View.NOTES)}
              className={`relative z-10 w-[100px] py-1.5 rounded-full text-sm font-medium transition-colors duration-300 ${activeView === View.NOTES ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              Notes
            </button>
          </nav>

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-white/40 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-white/60 dark:hover:bg-white/10 transition-all backdrop-blur-sm"
          >
            <AnimatePresence mode="wait">
              {theme === 'dark' ? (
                <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sun className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Moon className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>

      <div className="md:hidden absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-white/40 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 backdrop-blur-sm shadow-sm"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <main className={`relative z-10 mx-auto p-6 md:pt-8 ${isDashboard ? 'md:h-[calc(100vh-88px)]' : 'max-w-4xl pb-40 md:pb-20'}`}>

        <AnimatePresence mode='wait' custom={direction}>
          {activeView === View.TRACKER ? (
            <motion.div
              key="tracker"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="h-full"
            >
              {layoutMode === 'standard' ? (
                <TrackerStandard sessions={sessions} timerProps={timerProps} />
              ) : (
                <TrackerDashboard sessions={sessions} timerProps={timerProps} />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="notes"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="min-h-[80vh] mt-8"
            >
              <Notes />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-zinc-200 dark:border-white/5 flex justify-around py-4 z-50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-colors duration-500">
        <button
          onClick={() => handleViewChange(View.TRACKER)}
          className={`flex flex-col items-center gap-1.5 transition-colors duration-300 ${activeView === View.TRACKER ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-600'}`}
        >
          <LayoutDashboard className="w-6 h-6" strokeWidth={activeView === View.TRACKER ? 2.5 : 1.5} />
        </button>
        <button
          onClick={() => handleViewChange(View.NOTES)}
          className={`flex flex-col items-center gap-1.5 transition-colors duration-300 ${activeView === View.NOTES ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-600'}`}
        >
          <NotebookPen className="w-6 h-6" strokeWidth={activeView === View.NOTES ? 2.5 : 1.5} />
        </button>
      </div>

    </div>
  );
};

export default App;