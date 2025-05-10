import { Completion } from '@codemirror/autocomplete';

export interface CompletionState {
  active: boolean;
  options: Completion[];
  selected: number;
  from: number;
  to: number;
  explicitly: boolean;
}

export interface DocumentationInfo {
  description: string;
  syntax: string;
  example: string;
}

export interface Position {
  top: number;
  left: number;
}