// src/api.js
let mockServerNotes = [];

// Simulate network latency (ms)
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export async function fetchNotes() {
  await delay(500); // simulate network delay
  return [...mockServerNotes];
}

export async function createNote(note) {
  await delay(300);
  mockServerNotes.push(note);
  return note;
}

export async function updateNote(note) {
  await delay(300);
  const index = mockServerNotes.findIndex((n) => n.id === note.id);
  if (index !== -1) {
    mockServerNotes[index] = note;
    return note;
  } else {
    throw new Error('Note not found on server');
  }
}

export async function deleteNoteApi(id) {
  await delay(300);
  mockServerNotes = mockServerNotes.filter((n) => n.id !== id);
  return true;
}
