/**
 * Retry helper for flaky external calls — Supabase auth timing (verifyOtp JWT
 * collisions) under parallel Playwright workers. On failure, waits delayMs
 * (× attempt) before retrying. Extracted from seed-session.ts (<200-line rule).
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 2,
  delayMs: number = 250,
): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  throw lastError;
}
