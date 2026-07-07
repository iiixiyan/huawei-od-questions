import { useState, useCallback } from 'react';

const STORAGE_KEY = 'od-favorites';

function loadFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);

  const toggleFavorite = useCallback((pid: string) => {
    setFavorites(prev => {
      const next = prev.includes(pid)
        ? prev.filter(p => p !== pid)
        : [...prev, pid];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback((pid: string) => favorites.includes(pid), [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}
