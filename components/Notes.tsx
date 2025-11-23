import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { fetchNotes, saveNotes, deleteNote } from '../services/data';
import { supabase } from '../services/supabase';
import { Plus, Grid, List, Trash2, Save, X, Pencil, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadNotes();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadNotes();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadNotes = async () => {
    setIsLoading(true);
    const data = await fetchNotes();
    setNotes(data);
    setIsLoading(false);
  };

  const saveNotesToStorage = async (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    await saveNotes(updatedNotes);
  };

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;

    const now = Date.now();
    let updatedNotes;

    if (editingNote) {
      updatedNotes = notes.map(n => n.id === editingNote.id ? { ...n, title, content, updatedAt: now } : n);
    } else {
      const newNote: Note = {
        id: Math.random().toString(36).substr(2, 9),
        title: title || 'Untitled Note',
        content,
        updatedAt: now
      };
      updatedNotes = [newNote, ...notes];
    }

    await saveNotesToStorage(updatedNotes);
    closeEditor();
  };

  const handleDelete = async (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    await deleteNote(id);
    if (editingNote?.id === id) closeEditor();
  };

  const openEditor = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setTitle(note.title);
      setContent(note.content);
    } else {
      setEditingNote(null);
      setTitle('');
      setContent('');
    }
    setIsCreating(true);
  };

  const closeEditor = () => {
    setIsCreating(false);
    setEditingNote(null);
    setTitle('');
    setContent('');
  };

  if (isCreating) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="h-full flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <button onClick={closeEditor} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2 text-sm">
            <X className="w-4 h-4" /> Cancel
          </button>
          <button onClick={handleSave} className="bg-emerald-500 text-white dark:text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
            <Save className="w-4 h-4" /> Save Note
          </button>
        </div>
        <div className="flex-1 bg-white/60 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col p-6 backdrop-blur-xl shadow-2xl transition-colors duration-500">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            maxLength={100}
            className="w-full bg-transparent text-xl font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 border-none focus:ring-0 p-0 mb-4"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            maxLength={5000}
            className="w-full flex-1 bg-transparent text-zinc-600 dark:text-zinc-300 placeholder:text-zinc-400 border-none focus:ring-0 p-0 resize-none leading-relaxed"
          />
          <div className="text-xs text-zinc-400 text-right mt-2">
            {content.length}/5000
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-zinc-800 dark:text-white flex items-center gap-2 transition-colors">
          <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
          Reflections
        </h2>
        <div className="flex gap-2">
          <div className="flex bg-white dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <button onClick={() => setViewMode('gallery')} className={`p-2 rounded transition-colors ${viewMode === 'gallery' ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'}`}>
              <Grid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => openEditor()} className="bg-emerald-500 hover:bg-emerald-400 text-white dark:text-black p-2 rounded-lg transition-colors shadow-md">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl transition-colors min-h-[400px]">
          {isLoading ? (
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          ) : (
            <>
              <div className="bg-zinc-100 dark:bg-zinc-800/50 p-6 rounded-full mb-4 ring-1 ring-zinc-200 dark:ring-zinc-700/50">
                <Pencil className="w-8 h-8 opacity-40" />
              </div>
              <p className="text-lg font-medium text-zinc-600 dark:text-zinc-300">No notes yet</p>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Capture your focus and reflections here.</p>
            </>
          )}
        </div>
      ) : (
        <div className={viewMode === 'gallery' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'flex flex-col gap-3'}>
          <AnimatePresence>
            {notes.map(note => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => openEditor(note)}
                className={`group bg-white/60 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-500/50 hover:bg-white/80 dark:hover:bg-white/10 transition-colors cursor-pointer rounded-xl p-5 relative overflow-hidden shadow-sm dark:shadow-none ${viewMode === 'list' ? 'flex items-center justify-between' : 'flex flex-col h-48'}`}
              >
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-zinc-800 dark:text-zinc-200 mb-2 truncate transition-colors">{note.title}</h3>
                  <p className={`text-zinc-500 dark:text-zinc-400 text-sm transition-colors ${viewMode === 'list' ? 'truncate w-64 hidden md:block' : 'line-clamp-4'}`}>
                    {note.content}
                  </p>
                </div>
                <div className={`flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-600 ${viewMode === 'gallery' ? 'mt-4 pt-4 border-t border-zinc-100 dark:border-white/5' : 'gap-4'}`}>
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                    className="p-2 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};