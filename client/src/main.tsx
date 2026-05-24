import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// ── Восстановление сессии перед рендером ────────────────────────────────────────
// Используем ОТДЕЛЬНЫЙ вспомогательный файл без imporтов из main,
// чтобы избежать циклической зависимости main.tsx ↔ userStorage.ts.
interface _S {
  profile?: Record<string, unknown> | null;
  userId?: string | null;
  eventId?: string | null;
  sessionTimestamp?: number;
}

const SESSION_KEY = 'connecto_profile';
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 суток

function _readSession(): _S | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null'); }
  catch { return null; }
}

function _sessionExpired(): boolean {
  const s = _readSession();
  if (!s || typeof s.sessionTimestamp !== 'number') return true;
  return Date.now() - s.sessionTimestamp > SESSION_TTL;
}

if (!_sessionExpired()) {
  const s = _readSession();
  if (s?.userId)  localStorage.setItem('currentUserId', s.userId);
  if (s?.eventId) localStorage.setItem('currentEventId', s.eventId);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
