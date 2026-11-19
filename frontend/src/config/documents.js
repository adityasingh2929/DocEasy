import { BASE_URL } from './api';
export async function documentRequest(path, options = {}) {
  const response = await fetch(`${BASE_URL}/documents${path}`, {
    ...options, signal: AbortSignal.timeout(90000),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = new Error(typeof data.detail === 'string' ? data.detail : 'Could not complete the document request.');
    error.status = response.status;
    const retryAfter = Number(response.headers.get('Retry-After'));
    error.retryAfter = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 0;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}
export function uploadFile(file) {
  if (!/\.(pdf|docx|txt)$/i.test(file.name)) throw new Error('Choose a PDF, DOCX or TXT file.');
  if (!file.size || file.size > 5 * 1024 * 1024) throw new Error('Choose a non-empty file no larger than 5 MB.');
  const body = new FormData(); body.append('file', file);
  return documentRequest('/upload', { method: 'POST', body });
}
