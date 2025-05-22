# 📝 Offline-First Notes App with Sync

A markdown-based offline-first notes application built with React, supporting full offline functionality using IndexedDB and seamless syncing with a mock API once the network is restored.

---

## 🚀 Features

- Create, edit, and delete markdown-supported notes
- Offline-first with data stored in IndexedDB
- Autosave note edits with debounce
- Syncs with mock backend when online
- Displays sync status: Unsynced, Syncing, Synced, Error
- Detects and indicates online/offline connectivity
- Notes sorted by last updated time
- Search notes by title or content

---

## 🧑‍💻 Tech Stack

- **React** (Vite)
- **IndexedDB** (via `idb`)
- **Markdown rendering** (`react-markdown`)
- **Mock API** (`json-server`)
- **Plain CSS** for styling
- **JavaScript Fetch API** for network calls

---

## 📦 Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/offline-notesapp.git
   cd offline-notes-app
