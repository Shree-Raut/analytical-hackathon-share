import { createOpenAI, openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export interface LlmConfig {
  baseUrl?: string;
  apiKey?: string;
  model: string;
}

export function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function parseJsonResponse<T = Record<string, unknown>>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
}

export function getLlmConfig(overrides?: {
  modelEnvOrder?: string[];
  baseUrlEnvOrder?: string[];
  keyEnvOrder?: string[];
  defaultModel?: string;
}): LlmConfig {
  const modelEnvOrder = overrides?.modelEnvOrder || [
    "LITELLM_MODEL",
    "MESH_MODEL_ID",
    "OPENAI_MODEL",
  ];
  const baseUrlEnvOrder = overrides?.baseUrlEnvOrder || [
    "LITELLM_BASE_URL",
    "LITELLM_API_BASE",
    "LITELLM_PROXY_URL",
    "OPENAI_BASE_URL",
  ];
  const keyEnvOrder = overrides?.keyEnvOrder || ["LITELLM_API_KEY", "OPENAI_API_KEY"];
  const model =
    modelEnvOrder.map((key) => process.env[key]).find(Boolean) ||
    overrides?.defaultModel ||
    "gpt-4o-mini";
  const baseUrl = baseUrlEnvOrder.map((key) => process.env[key]).find(Boolean);
  const apiKey = keyEnvOrder.map((key) => process.env[key]).find(Boolean);
  return { baseUrl, apiKey, model };
}

export function hasLlmApiKey(): boolean {
  return Boolean(process.env.LITELLM_API_KEY || process.env.OPENAI_API_KEY);
}

export function createLlmProvider(config?: LlmConfig) {
  const resolved = config || getLlmConfig();
  if (resolved.baseUrl) {
    return createOpenAI({
      apiKey: resolved.apiKey || "",
      baseURL: `${trimTrailingSlash(resolved.baseUrl)}/v1`,
    });
  }
  return openai;
}

export async function callLlm(prompt: string, options?: { temperature?: number; config?: LlmConfig }) {
  const config = options?.config || getLlmConfig();
  if (!config.apiKey) return null;
  const provider = createLlmProvider(config);
  return generateText({
    model: provider(config.model),
    temperature: options?.temperature ?? 0.1,
    prompt,
  });
}
