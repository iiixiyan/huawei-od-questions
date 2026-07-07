import type { ParsedAcceptRate, Question } from '../types/question';

export function parseAcceptRate(str: string): ParsedAcceptRate {
  const parts = str.split('/');
  if (parts.length !== 2) return { passed: 0, total: 0, percentage: 0 };
  const passed = parseInt(parts[0]);
  const total = parseInt(parts[1]);
  return { passed, total, percentage: total > 0 ? Math.round(passed / total * 100) : 0 };
}

export function getAllTags(questions: Question[]): string[] {
  const set = new Set<string>();
  for (const q of questions) {
    const tags = q.tags || q.topics || [];
    for (const t of tags) set.add(t);
  }
  return Array.from(set).sort();
}

export function getDifficultyLabel(d: number): string {
  if (d <= 3) return '简单';
  if (d <= 6) return '中等';
  if (d <= 8) return '困难';
  return '极难';
}

export function getDifficultyColor(d: number): string {
  if (d <= 3) return '#52c41a';
  if (d <= 6) return '#faad14';
  if (d <= 8) return '#ff4d4f';
  return '#722ed1';
}
