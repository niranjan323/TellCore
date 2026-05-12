import type { QuestionResponse } from '../../types/contracts';

function parseValues(json: string): unknown[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [json];
  }
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

function answerIncludesAny(answer: unknown, values: unknown[]): boolean {
  const items = asArray(answer);
  return items.some((item) => values.some((v) => String(v) === String(item)));
}

export function shouldShowQuestion(
  question: QuestionResponse,
  answers: Record<string, unknown>,
): boolean {
  if (!question.conditions || question.conditions.length === 0) return true;
  return question.conditions.every((cond) => {
    const answer = answers[cond.dependsOnKey];
    const values = parseValues(cond.valuesJson);
    switch (cond.operator) {
      case 'in':
        return answerIncludesAny(answer, values);
      case 'not_in':
        return !answerIncludesAny(answer, values);
      case 'equals':
        return String(answer) === String(values[0]);
      case 'not_equals':
        return String(answer) !== String(values[0]);
      default:
        return true;
    }
  });
}

export function isAnswered(question: QuestionResponse, answer: unknown): boolean {
  if (question.type === 'infoblock') return true;
  if (Array.isArray(answer)) return answer.length > 0;
  if (typeof answer === 'string') return answer.trim().length > 0;
  if (typeof answer === 'number') return Number.isFinite(answer);
  return answer !== undefined && answer !== null;
}
