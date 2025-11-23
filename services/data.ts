import { supabase } from './supabase';
import { Session, Note } from '../types';
import { getStoredSessions, saveSession as saveLocalSession, getStoredNotesList, saveStoredNotesList } from './storage';

export const fetchSessions = async (): Promise<Session[]> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .order('timestamp', { ascending: false });

        if (error) {
            console.error('Error fetching sessions from Supabase:', error);
            return getStoredSessions();
        }
        return data || [];
    } else {
        return getStoredSessions();
    }
};

export const addSession = async (session: Session): Promise<Session[]> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { error } = await supabase
            .from('sessions')
            .insert([{
                id: session.id,
                user_id: user.id,
                date: session.date,
                duration: session.duration,
                timestamp: session.timestamp
            }]);

        if (error) {
            console.error('Error saving session to Supabase:', error);
        }

        return fetchSessions();
    } else {
        return saveLocalSession(session);
    }
};

export const fetchNotes = async (): Promise<Note[]> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching notes from Supabase:', error);
            return getStoredNotesList();
        }

        return (data as any[]).map(n => ({
            id: n.id,
            title: n.title,
            content: n.content,
            updatedAt: n.updated_at
        }));
    } else {
        return getStoredNotesList();
    }
};

export const saveNotes = async (notes: Note[]): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const updates = notes.map(note => ({
            id: note.id,
            user_id: user.id,
            title: note.title,
            content: note.content,
            updated_at: note.updatedAt
        }));

        const { error } = await supabase
            .from('notes')
            .upsert(updates);

        if (error) {
            console.error('Error syncing notes to Supabase:', error);
        }
    } else {
        saveStoredNotesList(notes);
    }
};

export const deleteNote = async (noteId: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', noteId);

        if (error) {
            console.error('Error deleting note from Supabase:', error);
        }
    }
};
