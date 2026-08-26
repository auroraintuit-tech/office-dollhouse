import { Platform } from 'react-native';

export interface AiTaskResult {
  title: string;
  summary: string;
  deliverable: string;
  nextSteps: string[];
  riskNote: string;
}

interface AiTaskRequest {
  task: string;
  companyName?: string;
  playerName?: string;
}

function normalizeBaseUrl(value: string): string {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/+$/, '');
}

function getApiBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (explicit) return normalizeBaseUrl(explicit);

  const replitDomain = process.env.EXPO_PUBLIC_DOMAIN?.trim();
  if (replitDomain) return normalizeBaseUrl(replitDomain);

  if (Platform.OS === 'web') return '';

  throw new Error('AI_SERVER_NOT_CONFIGURED');
}

function readErrorMessage(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const message = (value as Record<string, unknown>).message;
  return typeof message === 'string' && message.trim() ? message.trim() : null;
}

export async function executeAiTask(request: AiTaskRequest): Promise<AiTaskResult> {
  const response = await fetch(`${getApiBaseUrl()}/api/ai/task`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const payload = await response.json().catch(() => null) as unknown;
  if (!response.ok) {
    throw new Error(readErrorMessage(payload) ?? 'AI не смог обработать задачу.');
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('AI вернул некорректный результат.');
  }

  const result = payload as Partial<AiTaskResult>;
  if (
    typeof result.title !== 'string' ||
    typeof result.summary !== 'string' ||
    typeof result.deliverable !== 'string' ||
    !Array.isArray(result.nextSteps) ||
    !result.nextSteps.every((item) => typeof item === 'string') ||
    typeof result.riskNote !== 'string'
  ) {
    throw new Error('AI вернул неполный результат.');
  }

  return result as AiTaskResult;
}
