/**
 * AnythingLLM Client Service
 * Handles all communication with AnythingLLM API with retry logic, error handling, and streaming support
 */

import crypto from 'crypto';

export interface AnythingLLMConfig {
  baseUrl: string;
  apiKey: string;
  workspaceSlug: string;
  modelSlug?: string;
  maxRetries?: number;
  retryInitialDelayMs?: number;
  timeoutMs?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  workspace?: string;
  model?: string;
  messages: ChatMessage[];
  metadata?: Record<string, any>;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatStreamEvent {
  event: 'start' | 'delta' | 'done';
  id?: string;
  choices?: Array<{
    index: number;
    delta?: { role?: string; content?: string };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface AnythingLLMError extends Error {
  status?: number;
  retryable?: boolean;
  code?: string;
}

// Utility function for exponential backoff
function exponentialBackoff(attempt: number, initialDelayMs: number): number {
  const maxDelayMs = 8000;
  const delayMs = Math.min(initialDelayMs * Math.pow(2, attempt), maxDelayMs);
  const jitterMs = Math.random() * (delayMs * 0.1);
  return delayMs + jitterMs;
}

// Utility function for sleep
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main AnythingLLM Client Class
 */
export class AnythingLLMClient {
  private config: AnythingLLMConfig;

  constructor(config: AnythingLLMConfig) {
    this.config = {
      modelSlug: 'gpt-4',
      maxRetries: 5,
      retryInitialDelayMs: 500,
      timeoutMs: 30000,
      ...config,
    };

    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.config.baseUrl || typeof this.config.baseUrl !== 'string') {
      throw new Error('ANYTHINGLLM_BASE_URL is required and must be a valid string');
    }
    if (!this.config.apiKey || typeof this.config.apiKey !== 'string') {
      throw new Error('ANYTHINGLLM_API_KEY is required and must be a valid string');
    }
    if (!this.config.workspaceSlug || typeof this.config.workspaceSlug !== 'string') {
      throw new Error('ANYTHINGLLM_WORKSPACE_SLUG is required and must be a valid string');
    }

    // Validate URL format
    try {
      new URL(this.config.baseUrl);
    } catch (error) {
      throw new Error(`Invalid ANYTHINGLLM_BASE_URL format: ${error instanceof Error ? error.message : 'Unknown URL error'}`);
    }

    // Validate model slug if provided
    if (this.config.modelSlug && typeof this.config.modelSlug !== 'string') {
      throw new Error('ANYTHINGLLM_MODEL_SLUG must be a valid string if provided');
    }

    // Validate numeric configuration
    if (this.config.maxRetries !== undefined && (typeof this.config.maxRetries !== 'number' || this.config.maxRetries < 1)) {
      throw new Error('ANYTHINGLLM_MAX_RETRIES must be a positive number');
    }
    if (this.config.retryInitialDelayMs !== undefined && (typeof this.config.retryInitialDelayMs !== 'number' || this.config.retryInitialDelayMs < 100)) {
      throw new Error('ANYTHINGLLM_RETRY_INITIAL_DELAY_MS must be a number >= 100');
    }
    if (this.config.timeoutMs !== undefined && (typeof this.config.timeoutMs !== 'number' || this.config.timeoutMs < 1000)) {
      throw new Error('ANYTHINGLLM_REQUEST_TIMEOUT_MS must be a number >= 1000');
    }
  }

  /**
   * Send a chat message with retry logic
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const maxRetries = this.config.maxRetries!;
    const retryInitialDelayMs = this.config.retryInitialDelayMs!;
    const timeoutMs = this.config.timeoutMs!;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(`${this.config.baseUrl}/v1/chat`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workspace: request.workspace || this.config.workspaceSlug,
            model: request.model || this.config.modelSlug,
            messages: request.messages,
            metadata: request.metadata || {},
            stream: request.stream ?? false,
            temperature: request.temperature ?? 0.0,
            max_tokens: request.max_tokens ?? 1500,
            top_p: request.top_p ?? 1.0,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutHandle);

        if (response.ok) {
          return await response.json();
        }

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delayMs = retryAfter
            ? parseInt(retryAfter, 10) * 1000
            : exponentialBackoff(attempt, retryInitialDelayMs);

          console.warn(
            `[AnythingLLM] Rate limited. Retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})`
          );
          await sleep(delayMs);
          continue;
        }

        // Handle server errors
        if (response.status >= 500) {
          const delayMs = exponentialBackoff(attempt, retryInitialDelayMs);
          console.warn(
            `[AnythingLLM] Server error (${response.status}). Retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})`
          );
          await sleep(delayMs);
          continue;
        }

        // 4xx errors are not retryable
        const errorBody = await response.text();
        const error: AnythingLLMError = new Error(
          `AnythingLLM API error: ${response.status} ${errorBody}`
        );
        error.status = response.status;
        error.retryable = false;
        throw error;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          const timeoutError: AnythingLLMError = new Error(
            `AnythingLLM request timeout after ${timeoutMs}ms`
          );
          timeoutError.retryable = true;
          lastError = timeoutError;

          if (attempt < maxRetries - 1) {
            const delayMs = exponentialBackoff(attempt, retryInitialDelayMs);
            console.warn(
              `[AnythingLLM] Request timeout. Retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})`
            );
            await sleep(delayMs);
          }
        } else {
          lastError = error;

          if (attempt < maxRetries - 1 && (error.retryable !== false)) {
            const delayMs = exponentialBackoff(attempt, retryInitialDelayMs);
            console.warn(
              `[AnythingLLM] Request failed: ${error.message}. Retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})`
            );
            await sleep(delayMs);
          }
        }
      }
    }

    const finalError: AnythingLLMError = new Error(
      `All ${maxRetries} retry attempts failed. Last error: ${lastError?.message}`
    );
    finalError.retryable = false;
    throw finalError;
  }

  /**
   * Stream a chat message
   */
  async *streamChat(request: ChatRequest): AsyncGenerator<ChatStreamEvent, void, unknown> {
    const timeoutMs = this.config.timeoutMs!;
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.config.baseUrl}/v1/chat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspace: request.workspace || this.config.workspaceSlug,
          model: request.model || this.config.modelSlug,
          messages: request.messages,
          stream: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutHandle);

      if (!response.ok) {
        throw new Error(`Stream error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.slice(6));
              yield json as ChatStreamEvent;
            } catch (e) {
              // Ignore parsing errors
              console.warn('[AnythingLLM] Failed to parse stream chunk:', e);
            }
          }
        }
      }
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  /**
   * Verify webhook signature (HMAC SHA256)
   */
  verifyWebhookSignature(
    rawBody: string,
    signature: string,
    secret: string,
    timestamp: string,
    maxAgeSeconds: number = 300
  ): boolean {
    // Check timestamp (prevent replay attacks)
    const signedTime = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - signedTime > maxAgeSeconds) {
      console.warn('[AnythingLLM] Webhook timestamp too old, possible replay attack');
      return false;
    }

    // Verify HMAC signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawBody);
    const expected = `sha256=${hmac.digest('hex')}`;

    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch (e) {
      return false;
    }
  }

  /**
   * Log structured message for observability
   */
  logRequest(data: Record<string, any>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      service: 'anythingllm-client',
      ...data,
    };
    console.log('[AnythingLLM]', JSON.stringify(logEntry));
  }

  logError(data: Record<string, any>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      service: 'anythingllm-client',
      ...data,
    };
    console.error('[AnythingLLM]', JSON.stringify(logEntry));
  }
}

/**
 * Create and export a singleton client instance
 */
export function createAnythingLLMClient(): AnythingLLMClient {
  const baseUrl = process.env.NEXT_PUBLIC_ANYTHINGLLM_BASE_URL || '';
  const apiKey = process.env.ANYTHINGLLM_API_KEY || '';
  const workspaceSlug = process.env.NEXT_PUBLIC_ANYTHINGLLM_WORKSPACE_SLUG || '';

  return new AnythingLLMClient({
    baseUrl,
    apiKey,
    workspaceSlug,
    modelSlug: process.env.NEXT_PUBLIC_ANYTHINGLLM_MODEL_SLUG,
    maxRetries: parseInt(process.env.ANYTHINGLLM_MAX_RETRIES || '5', 10),
    retryInitialDelayMs: parseInt(process.env.ANYTHINGLLM_RETRY_INITIAL_DELAY_MS || '500', 10),
    timeoutMs: parseInt(process.env.ANYTHINGLLM_REQUEST_TIMEOUT_MS || '30000', 10),
  });
}
