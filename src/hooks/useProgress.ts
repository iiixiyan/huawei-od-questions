import { useState, useCallback } from 'react';
import type { ProgressStatus, UserProgress } from '../types/question';

const STORAGE_KEY = 'od-progress';

function loadProgress(): UserProgress {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  const setStatus = useCallback((pid: string, status: ProgressStatus) => {
    setProgress(prev => {
      const next = { ...prev, [pid]: status };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const getStatus = useCallback((pid: string): ProgressStatus => {
    return progress[pid] || 'undone';
  }, [progress]);

  const getStats = useCallback(() => {
    const values = Object.values(progress);
    return {
      done: values.filter(v => v === 'done').length,
      doing: values.filter(v => v === 'doing').length,
      undone: values.filter(v => v === 'undone').length,
    };
  }, [progress]);

  return { progress, setStatus, getStatus, getStats };
}
