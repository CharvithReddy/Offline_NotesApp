import React, { useState } from 'react';

export default function NoteList({ notes, onSelect, selectedNoteId, searchTerm, onSearch }) {
  return (
    <div style={{ width: '300px', borderRight: '1px solid #ccc', display: 'flex', flexDirection: 'column' }}>
      <input
        type="text"
        placeholder="Search notes..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        style={{ padding: '0.5rem', margin: '0.5rem' }}
      />
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {notes.length === 0 && <p style={{ padding: '0.5rem' }}>No notes found</p>}
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => onSelect(note.id)}
            style={{
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              backgroundColor: selectedNoteId === note.id ? '#ddd' : 'transparent',
              borderBottom: '1px solid #eee',
            }}
          >
            <strong>{note.title || '(No title)'}</strong>
            <br />
            <small>{new Date(note.updatedAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
