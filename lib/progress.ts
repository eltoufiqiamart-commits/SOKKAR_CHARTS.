'use client';
/* localStorage-backed progress. No account required. */
import { useCallback, useEffect, useState } from 'react';

const KEY_COMPLETED = 'sokkar:completed';
const KEY_SAVED = 'sokkar:saved';
const KEY_LAST = 'sokkar:last-opened';
const KEY_STREAK = 'sokkar:streak';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('sokkar:progress'));
  } catch {
    /* storage unavailable */
  }
}

export function useProgress() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setCompleted(read<string[]>(KEY_COMPLETED, []));
    setSaved(read<string[]>(KEY_SAVED, []));
  }, []);

  useEffect(() => {
    refresh();
    setHydrated(true);
    const onProgress = () => refresh();
    const onStorage = (e: StorageEvent) => { if (e.key?.startsWith('sokkar:')) refresh(); };
    window.addEventListener('sokkar:progress', onProgress);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('sokkar:progress', onProgress);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  const toggleCompleted = useCallback((slug: string) => {
    const current = read<string[]>(KEY_COMPLETED, []);
    const next = current.includes(slug) ? current.filter(s => s !== slug) : [...current, slug];
    write(KEY_COMPLETED, next);
    if (next.includes(slug)) {
      // streak tracking
      const today = new Date().toDateString();
      const streak = read<{ count: number; last: string }>(KEY_STREAK, { count: 0, last: '' });
      if (streak.last !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const count = streak.last === yesterday ? streak.count + 1 : 1;
        write(KEY_STREAK, { count, last: today });
      }
    }
  }, []);

  const toggleSaved = useCallback((slug: string) => {
    const current = read<string[]>(KEY_SAVED, []);
    write(KEY_SAVED, current.includes(slug) ? current.filter(s => s !== slug) : [...current, slug]);
  }, []);

  const recordVisit = useCallback((slug: string) => {
    write(KEY_LAST, slug);
  }, []);

  return { completed, saved, hydrated, toggleCompleted, toggleSaved, recordVisit, isCompleted: (s: string) => completed.includes(s), isSaved: (s: string) => saved.includes(s) };
}

export function readLastOpened(): string | null {
  try { const v = localStorage.getItem(KEY_LAST); return v ? JSON.parse(v) : null; } catch { return null; }
}

export function totalCompleted(): number {
  try { return (JSON.parse(localStorage.getItem(KEY_COMPLETED) ?? '[]') as string[]).length; } catch { return 0; }
}

export function totalSaved(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY_SAVED) ?? '[]') as string[]; } catch { return []; }
}

export function readStreak(): { count: number; last: string } {
  try {
    const v = localStorage.getItem(KEY_STREAK);
    return v ? JSON.parse(v) as { count: number; last: string } : { count: 0, last: '' };
  } catch { return { count: 0, last: '' }; }
}
