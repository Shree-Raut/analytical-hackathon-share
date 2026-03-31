export async function apiRequest<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, init);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((payload as { error?: string }).error || `Request failed: ${url}`);
  }
  return payload as T;
}

export const fastPassApi = {
  getMetrics: () =>
    apiRequest<{ categories?: Record<string, Array<Record<string, unknown>>> }>(
      "/api/metrics",
    ),
  uploadReport: (formData: FormData) =>
    apiRequest<Record<string, unknown>>("/api/upload", {
      method: "POST",
      body: formData,
    }),
  mapColumns: (headers: string[]) =>
    apiRequest<{ mappings?: unknown[] }>("/api/fast-pass/map", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headers }),
    }),
  submitFeedback: (signals: unknown[], source = "fast-pass-ui") =>
    apiRequest<{ success: boolean; recorded: number }>("/api/fast-pass/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, signals }),
    }),
  clarify: (mappings: unknown[]) =>
    apiRequest<{ questions?: unknown[] }>("/api/fast-pass/clarify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mappings }),
    }),
  clarifyChat: (payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/api/fast-pass/clarify/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  getTemplates: () => apiRequest<Array<{ id: string; slug: string }>>("/api/templates"),
  saveReport: (payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/api/reports/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  createSchedule: (payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
};
