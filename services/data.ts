import { supabase } from './supabase';
import { Session, Note } from '../types';
import { getStoredSessions, saveSession as saveLocalSession, getStoredNotesList, saveStoredNotesList } from './storage';

// --- Sessions ---

export const fetchSessions = async (): Promise<Session[]> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .order('timestamp', { ascending: false });

        if (error) {
            console.error('Error fetching sessions from Supabase:', error);
            return getStoredSessions(); // Fallback
        }
        return data || [];
    } else {
        return getStoredSessions();
    }
};

export const addSession = async (session: Session): Promise<Session[]> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // Save to Supabase
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
            // Fallback to local? Or just error? For now, let's do both for safety if offline support is needed later
            // But strictly speaking, if logged in, we want cloud source of truth.
        }

        // Return updated list
        return fetchSessions();
    } else {
        return saveLocalSession(session);
    }
};

// --- Notes ---

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

        // Map DB columns to Note type if needed (Supabase returns snake_case usually, but we used same names)
        // Our SQL schema used 'updated_at' (bigint) which matches our type.
        return (data as any[]).map(n => ({
            id: n.id,
            title: n.title,
            content: n.content,
            updatedAt: n.updated_at // SQL column was updated_at, type is updatedAt. Need to map.
        }));
    } else {
        return getStoredNotesList();
    }
};

export const saveNotes = async (notes: Note[]): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // We need to upsert the changed notes. 
        // Since this function receives the WHOLE list, efficient syncing is tricky without knowing what changed.
        // For simplicity in this migration: we will upsert all of them. 
        // In a real app, we'd want granular updates.

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
    // For local, the saveNotes function handles the full list update, so explicit delete isn't called there usually,
    // but we might need to refactor Notes.tsx to use this.
};
