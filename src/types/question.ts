export interface Question {
  pid: string;
  title: string;
  date: string;
  difficulty: number;
  tags: string[];
  description_md: string;
  code_templates: Record<string, string>;
  has_signature: boolean;
  python_signature: string | null;
  accept_rate: string;
  solution: string;
  topics?: string[];
}

export interface TopLevel {
  题库名称: string;
  题库描述: string;
  题库说明: string;
  总题数: number;
  有完整函数签名: number;
  题目列表: Question[];
}

export interface ParsedAcceptRate {
  passed: number;
  total: number;
  percentage: number;
}

export type ProgressStatus = 'undone' | 'doing' | 'done';
export type UserProgress = Record<string, ProgressStatus>;
