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
import { LoginModal } from './components/Auth/LoginModal';
import { supabase, signOut, getCurrentUser } from './services/supabase';
import { fetchSessions, addSession } from './services/data';
import { Session, View } from './types';
import { STORAGE_KEYS } from './constants';
import { User } from '@supabase/supabase-js';
import { LogOut, User as UserIcon, X } from 'lucide-react';

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);



const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.TRACKER);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [layoutMode, setLayoutMode] = useState<'standard' | 'dashboard'>('standard');
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const {
    elapsedTime,
    isRunning,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer
  } = useTimer();

  const [targetMinutes, setTargetMinutes] = useState(30);

  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check for errors in URL (Supabase Auth redirects)
    const hash = window.location.hash;
    if (hash && hash.includes('error=')) {
      const params = new URLSearchParams(hash.substring(1));
      const errorDescription = params.get('error_description');
      if (errorDescription) {
        setAuthError(errorDescription.replace(/\+/g, ' '));
        // Clear hash to clean up URL
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    // Check for initial user
    getCurrentUser().then(setUser);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth event:', _event, session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setAuthError(null); // Clear error on success
        loadSessions();
      }
    });

    loadSessions();

    const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as 'dark' | 'light' | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }


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

  const loadSessions = async () => {
    const data = await fetchSessions();
    setSessions(data);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleLayout = () => {
    setLayoutMode(prev => prev === 'standard' ? 'dashboard' : 'standard');
  }

  const handleLogout = async () => {
    await signOut();
    setIsUserMenuOpen(false);
  };

  const handleViewChange = (view: View) => {
    setActiveView(view);
  };

  const handleStop = async () => {
    const duration = stopTimer();
    if (duration > 10) {
      const newSession: Session = {
        id: generateId(),
        date: new Date().toISOString(),
        duration: duration,
        timestamp: Date.now(),
      };
      const updated = await addSession(newSession);
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


  const isDashboard = layoutMode === 'dashboard' && activeView === View.TRACKER;

  return (
    <div className={`relative h-screen font-sans selection:bg-emerald-500/30 ${isDashboard ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}`}>


      <motion.div
        initial={false}
        animate={{ opacity: theme === 'light' ? 1 : 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className="fixed inset-0 z-0 bg-gradient-to-br from-zinc-50 to-zinc-200 pointer-events-none"
      />


      <motion.div
        initial={false}
        animate={{ opacity: theme === 'dark' ? 1 : 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className="fixed inset-0 z-0 bg-gradient-to-br from-[#050505] to-zinc-950 pointer-events-none"
      />


      <div className="fixed top-0 left-0 right-0 h-[500px] z-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none transition-colors duration-700"></div>

      {authError && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-red-500 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
          <span>{authError}</span>
          <button onClick={() => setAuthError(null)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <header className="hidden md:flex items-center justify-between px-12 py-6 border-b border-zinc-200/50 dark:border-white/5 backdrop-blur-md sticky top-0 z-50 bg-white/30 dark:bg-black/20 transition-colors duration-500 h-[88px]">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLayout}
            className="hidden lg:block p-2 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400 transition-colors mr-1"
            title="Toggle Layout"
          >
            {layoutMode === 'standard' ? <Columns className="w-5 h-5" /> : <Rows className="w-5 h-5" />}
          </button>

          <button
            onClick={() => handleViewChange(View.TRACKER)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
          >
            <img src="/logo.png" alt="Flow State Tracker" className="w-10 h-10 drop-shadow-lg" />
            <span className="text-xl font-bold tracking-tight text-zinc-800 dark:text-white/90 transition-colors duration-500">Flow State Tracker</span>
          </button>
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

          {/* Auth Button */}
          <div className="relative">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  {user.user_metadata.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="font-bold text-sm">{user.email?.[0].toUpperCase()}</span>
                  )}
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full p-3 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-4 py-2 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-zinc-500/20"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

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