export const BASE_URL = (import.meta.env.VITE_API_URL || "https://doceasy-zzh2.onrender.com").replace(/\/+$/, "");

export async function postJSON(path, payload, signal) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(90000)]) : AbortSignal.timeout(90000),
  });
  if (!response.ok) throw new Error("The server could not complete this request. Please try again.");
  return response.json();
}
