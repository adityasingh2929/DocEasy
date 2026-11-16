export const BASE_URL = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://127.0.0.1:8000" : "https://doceasy-zzh2.onrender.com")).replace(/\/+$/, "");

export async function postJSON(path, payload, signal) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(90000)]) : AbortSignal.timeout(90000),
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    const error = new Error(typeof detail.detail === 'string' ? detail.detail : 'The server could not complete this request.');
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export async function getJSON(path, signal) {
  const response = await fetch(`${BASE_URL}${path}`, { signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('Could not load the reviewed exercise.');
  return response.json();
}
