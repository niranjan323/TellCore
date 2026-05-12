import type { ComponentType } from 'react';
import type { QuestionResponse } from '../../types/contracts';
import { BodyMapQuestion } from './BodyMapQuestion';
import { CheckboxQuestion } from './CheckboxQuestion';
import { ChipsQuestion } from './ChipsQuestion';
import { DateQuestion } from './DateQuestion';
import { InfoBlock } from './InfoBlock';
import { RadioQuestion } from './RadioQuestion';
import { SliderQuestion } from './SliderQuestion';
import { TextAreaQuestion } from './TextAreaQuestion';
import { TextInputQuestion } from './TextInputQuestion';
import type { QuestionProps } from './types';

const REGISTRY: Record<string, ComponentType<QuestionProps>> = {
  textarea: TextAreaQuestion,
  textinput: TextInputQuestion,
  chips: ChipsQuestion,
  radio: RadioQuestion,
  checkbox: CheckboxQuestion,
  bodymap: BodyMapQuestion,
  slider: SliderQuestion,
  datepicker: DateQuestion,
  infoblock: InfoBlock,
};

interface QuestionRendererProps {
  question: QuestionResponse;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function QuestionRenderer({ question, value, onChange }: QuestionRendererProps) {
  const Component = REGISTRY[question.type as keyof typeof REGISTRY];
  if (!Component) {
    return (
      <div className="rounded-md border bg-surface p-4 text-sm text-text-secondary">
        Unsupported question type: {question.type}
      </div>
    );
  }
  return (
    <Component
      id={`q-${question.key}`}
      label={question.label}
      placeholder={question.placeholder}
      helpText={question.helpText}
      required={question.isRequired}
      options={question.options}
      config={question.config}
      value={value}
      onChange={onChange}
    />
  );
}
