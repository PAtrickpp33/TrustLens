// Small typed client for your FastAPI
// Robust base URL resolution to avoid mixed-content issues in browsers
import { env } from './env';
function resolveApiBase(): string {
  const configured = (env.apiBaseUrl ?? "").trim();
  let base = configured;

  if (typeof window !== "undefined") {
    // If not configured, return empty string so requests use same-origin relative path.
    // This relies on a reverse proxy (prod) or Vite dev proxy to forward /api to backend.
    if (!base) return "";
  }

  return base.replace(/\/$/, "");
}

export const API_BASE = resolveApiBase();

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: unknown;
};

export type UrlRiskData = {
  url: string;
  risk_level: 0 | 1 | 2 | 3;
  phishing_flag: number;
  report_count: number;
  source?: string | null;
  notes?: string | null;
};

export type EmailRiskData = {
  address: string;
  risk_level: 0 | 1 | 2 | 3;
  mx_valid: number;
  disposable: number;
  report_count: number;
  source?: string | null;
  notes?: string | null;
};

export type MobileRiskData = {
  e164: string;
  risk_level: 0 | 1 | 2 | 3;
  mx_valid: number;
  report_count: number;
  source?: string | null;
  notes?: string | null;
};

// Typechecking for Mobile check payload

type MobileCheckPayload = {
  e164: string;             // e.g., "+61412345678"
  country_code: string;     // e.g., "+61"
  national_number: string;  // e.g., "412345678"
};

// URL check request to backend API

export async function checkUrl(url: string, timeoutMs = 12000): Promise<UrlRiskData> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  const res = await fetch(`${API_BASE}/api/v1/url/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
    signal: controller.signal,
  }).catch((e) => {
    throw new Error(e?.message ?? "Network error");
  });
  clearTimeout(t);

  if (!res.ok) {
    // surface FastAPI 400/422 messages when present
    const maybeJson = await res.text().catch(() => "");
    try {
      const j = JSON.parse(maybeJson);
      throw new Error(j?.detail ?? `HTTP ${res.status}`);
    } catch {
      throw new Error(`HTTP ${res.status}`);
    }
  }

  const json = (await res.json()) as ApiResponse<UrlRiskData>;
  if (!json?.success || !json?.data) {
    throw new Error((json as any)?.error ?? "Unexpected API response");
  }
  return json.data;
}

// Email address check request to backend API

export async function checkEmail(
  address: string,
  timeoutMs = 12_000
): Promise<EmailRiskData> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  const res = await fetch(`${API_BASE}/api/v1/email/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
    signal: controller.signal,
  }).catch((e) => {
    throw new Error(e?.message ?? "Network error");
  });
  clearTimeout(t);

  if (!res.ok) {
    const maybeText = await res.text().catch(() => "");
    try {
      const j = JSON.parse(maybeText);
      throw new Error(j?.detail ?? `HTTP ${res.status}`);
    } catch {
      throw new Error(`HTTP ${res.status}`);
    }
  }

  const json = (await res.json()) as ApiResponse<EmailRiskData>;
  if (!json?.success || !json?.data) {
    throw new Error((json as any)?.error ?? "Unexpected API response");
  }
  return json.data;
}

// Mobile number check request to backend API

export async function checkMobile(
  payload: MobileCheckPayload,
  timeoutMs = 12_000
): Promise<MobileRiskData> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  const res = await fetch(`${API_BASE}/api/v1/mobile/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: controller.signal,
  }).catch((e) => {
    throw new Error(e?.message ?? "Network error");
  });
  clearTimeout(t);

  if (!res.ok) {
    const maybeText = await res.text().catch(() => "");
    try {
      const j = JSON.parse(maybeText);
      throw new Error(j?.detail ?? `HTTP ${res.status}`);
    } catch {
      throw new Error(`HTTP ${res.status}`);
    }
  }

  const json = (await res.json()) as ApiResponse<MobileRiskData>;
  if (!json?.success || !json?.data) {
    throw new Error((json as any)?.error ?? "Unexpected API response");
  }
  return json.data;
}

// Report endpoints

export async function reportUrl(url: string, timeoutMs = 12_000): Promise<UrlRiskData> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  const res = await fetch(`${API_BASE}/api/v1/url/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
    signal: controller.signal,
  }).catch((e) => {
    throw new Error(e?.message ?? "Network error");
  });
  clearTimeout(t);

  if (!res.ok) {
    const maybeText = await res.text().catch(() => "");
    try {
      const j = JSON.parse(maybeText);
      throw new Error(j?.detail ?? `HTTP ${res.status}`);
    } catch {
      throw new Error(`HTTP ${res.status}`);
    }
  }

  const json = (await res.json()) as ApiResponse<UrlRiskData>;
  if (!json?.success || !json?.data) {
    throw new Error((json as any)?.error ?? "Unexpected API response");
  }
  return json.data;
}

export async function reportEmail(address: string, timeoutMs = 12_000): Promise<EmailRiskData> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  const res = await fetch(`${API_BASE}/api/v1/email/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
    signal: controller.signal,
  }).catch((e) => {
    throw new Error(e?.message ?? "Network error");
  });
  clearTimeout(t);

  if (!res.ok) {
    const maybeText = await res.text().catch(() => "");
    try {
      const j = JSON.parse(maybeText);
      throw new Error(j?.detail ?? `HTTP ${res.status}`);
    } catch {
      throw new Error(`HTTP ${res.status}`);
    }
  }

  const json = (await res.json()) as ApiResponse<EmailRiskData>;
  if (!json?.success || !json?.data) {
    throw new Error((json as any)?.error ?? "Unexpected API response");
  }
  return json.data;
}

type MobileReportPayload = {
  e164?: string;
  country_code?: string;
  national_number?: string;
};

export async function reportMobile(
  payload: MobileReportPayload,
  timeoutMs = 12_000
): Promise<MobileRiskData> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  const res = await fetch(`${API_BASE}/api/v1/mobile/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: controller.signal,
  }).catch((e) => {
    throw new Error(e?.message ?? "Network error");
  });
  clearTimeout(t);

  if (!res.ok) {
    const maybeText = await res.text().catch(() => "");
    try {
      const j = JSON.parse(maybeText);
      throw new Error(j?.detail ?? `HTTP ${res.status}`);
    } catch {
      throw new Error(`HTTP ${res.status}`);
    }
  }

  const json = (await res.json()) as ApiResponse<MobileRiskData>;
  if (!json?.success || !json?.data) {
    throw new Error((json as any)?.error ?? "Unexpected API response");
  }
  return json.data;
}