import React, { useState, useEffect, useRef } from 'react';
import ReactMde from 'react-mde';
import ReactMarkdown from 'react-markdown';
import 'react-mde/lib/styles/css/react-mde-all.css';

export default function NoteEditor({ note, onSave, onDelete }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [selectedTab, setSelectedTab] = useState('write');

  // Keep track of previous note id
  const prevNoteIdRef = useRef();

  useEffect(() => {
    // Only reset title/content if note id changed (new note selected)
    if (note?.id !== prevNoteIdRef.current) {
      setTitle(note?.title || '');
      setContent(note?.content || '');
      prevNoteIdRef.current = note?.id;
    }
  }, [note]);

  // Debounced save
  useEffect(() => {
    const handler = setTimeout(() => {
      if (note) {
        onSave({ ...note, title, content, updatedAt: new Date().toISOString() });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [title, content, note, onSave]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', borderLeft: '1px solid #ccc' }}>
      <input
        type="text"
        placeholder="Note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ fontSize: '1.2rem', padding: '0.5rem', marginBottom: '1rem' }}
      />
      <ReactMde
        value={content}
        onChange={setContent}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={(markdown) =>
          Promise.resolve(<ReactMarkdown>{markdown}</ReactMarkdown>)
        }
      />
      <button
        onClick={() => onDelete(note.id)}
        style={{ marginTop: '1rem', backgroundColor: 'red', color: 'white', padding: '0.5rem' }}
      >
        Delete Note
      </button>
    </div>
  );
}
