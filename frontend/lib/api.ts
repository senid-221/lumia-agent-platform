const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000').replace(/\/$/, '');

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'Request failed');
  return data as T;
}

export function apiUrl(path: string) { return `${API_URL}${path}`; }
