const rawBase = (import.meta.env?.VITE_API_BASE || '').replace(/\/$/, '');

if (!rawBase) {
  // Fail fast in production if the API base is not configured
  console.warn('[api] VITE_API_BASE is not set; calls will likely fail in production.');
}

export const API_BASE = rawBase;

export function apiFetch(path, options) {
  const url = `${API_BASE}${path}`;
  return fetch(url, options);
}
