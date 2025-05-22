import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { getAllNotes, saveNote, deleteNote } from './db';
import { fetchNotes, createNote, updateNote, deleteNoteApi } from './api';

import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import SyncStatus from './components/SyncStatus';

function App() {
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatuses, setSyncStatuses] = useState({}); // { id: 'synced'|'unsynced'|'syncing'|'error' }
  const [searchTerm, setSearchTerm] = useState('');

  // Load notes from IndexedDB on mount
  useEffect(() => {
    (async () => {
      const localNotes = await getAllNotes();
      setNotes(localNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
      if (localNotes.length) setSelectedNoteId(localNotes[0].id);
    })();
  }, []);

  // Online/offline event listeners
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Sync logic
  const syncNotes = useCallback(async () => {
    if (!isOnline) return;

    // Sync each note separately
    for (const note of notes) {
      if (syncStatuses[note.id] === 'syncing') continue; // Skip already syncing

      if (!note.synced) {
        try {
          setSyncStatuses((s) => ({ ...s, [note.id]: 'syncing' }));

          if (note._deleted) {
            await deleteNoteApi(note.id);
            await deleteNote(note.id);
            setNotes((ns) => ns.filter((n) => n.id !== note.id));
            setSyncStatuses((s) => {
              const copy = { ...s };
              delete copy[note.id];
              return copy;
            });
            continue;
          }

          if (!note._syncedOnce) {
            // Create on server
            await createNote(note);
          } else {
            // Update on server
            await updateNote(note);
          }

          // Mark note as synced locally
          const updatedNote = { ...note, synced: true, _syncedOnce: true };
          await saveNote(updatedNote);
          setNotes((ns) => ns.map((n) => (n.id === note.id ? updatedNote : n)));
          setSyncStatuses((s) => ({ ...s, [note.id]: 'synced' }));
        } catch (e) {
          setSyncStatuses((s) => ({ ...s, [note.id]: 'error' }));
          console.error('Sync error for note', note.id, e);
        }
      }
    }
  }, [notes, isOnline, syncStatuses]);

  // Run sync whenever online or notes change
  useEffect(() => {
    syncNotes();
  }, [isOnline, notes]);

  // Create new note
  function handleNewNote() {
    const newNote = {
      id: uuidv4(),
      title: '',
      content: '',
      updatedAt: new Date().toISOString(),
      synced: false,
      _syncedOnce: false,
    };
    saveNote(newNote);
    setNotes((ns) => [newNote, ...ns]);
    setSelectedNoteId(newNote.id);
    setSyncStatuses((s) => ({ ...s, [newNote.id]: 'unsynced' }));
  }

  // Save note changes (debounced autosave handled in editor)
  async function handleSaveNote(updatedNote) {
    updatedNote.updatedAt = new Date().toISOString();
    updatedNote.synced = false;
    await saveNote(updatedNote);
    setNotes((ns) => {
      const filtered = ns.filter((n) => n.id !== updatedNote.id);
      return [updatedNote, ...filtered].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });
    setSyncStatuses((s) => ({ ...s, [updatedNote.id]: 'unsynced' }));
  }

  // Delete note
  async function handleDeleteNote(id) {
    // Mark note as deleted and unsynced for sync to backend
    const noteToDelete = notes.find((n) => n.id === id);
    if (noteToDelete) {
      const deletedNote = { ...noteToDelete, _deleted: true, synced: false };
      await saveNote(deletedNote);
      setNotes((ns) => ns.filter((n) => n.id !== id));
      setSyncStatuses((s) => ({ ...s, [id]: 'unsynced' }));

      if (selectedNoteId === id) setSelectedNoteId(null);
    }
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          backgroundColor: isOnline ? '#0a0' : '#a00',
          color: 'white',
          padding: '0.5rem 1rem',
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        {isOnline ? 'Online' : 'Offline'}
      </header>
      <div style={{ flex: 1, display: 'flex' }}>
        <NoteList
          notes={filteredNotes}
          onSelect={setSelectedNoteId}
          selectedNoteId={selectedNoteId}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.5rem', borderBottom: '1px solid #ccc' }}>
            <button onClick={handleNewNote}>+ New Note</button>
            {selectedNote && (
              <span style={{ marginLeft: '1rem' }}>
                <SyncStatus status={syncStatuses[selectedNote.id] || (selectedNote.synced ? 'synced' : 'unsynced')} />
              </span>
            )}
          </div>
          {selectedNote ? (
            <NoteEditor note={selectedNote} onSave={handleSaveNote} onDelete={handleDeleteNote} />
          ) : (
            <div style={{ padding: '1rem' }}>Select or create a note to get started.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
