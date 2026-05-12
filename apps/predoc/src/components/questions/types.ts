import type { QuestionOptionResponse } from '../../types/contracts';

export interface QuestionProps {
  label: string;
  placeholder?: string | null;
  value: unknown;
  onChange: (value: unknown) => void;
  required?: boolean;
  helpText?: string | null;
  options?: QuestionOptionResponse[];
  config?: unknown;
  id: string;
}
