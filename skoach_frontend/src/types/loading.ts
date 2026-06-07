export type LoadingType = 'SCRIPT_GENERATE' | 'PRONUNCIATION_COACH' | 'PRONUNCIATION_EVAL';

export interface StepItem {
  label: string;
  status: 'todo' | 'loading' | 'done';
}