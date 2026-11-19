import { BASE_URL } from '../config/api';

export const account = () => {
  try { return JSON.parse(sessionStorage.getItem('doceasy-account') || 'null'); } catch { return null; }
};
export async function accountRequest(path, method = 'GET', body, token = account()?.token) {
  const response = await fetch(`${BASE_URL}/auth${path}`, {
    method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(90000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Unable to connect. Please try again.');
  return data;
}
export const progressKey = id => `docs_made_easy_progress:${id}`;
let saveQueue = Promise.resolve();
export function syncProgress(progress) {
  const owner = account();
  if (!owner) return Promise.resolve();
  const key = progressKey(owner.user.id);
  const snapshot = JSON.stringify(progress);
  saveQueue = saveQueue.catch(() => {}).then(async () => {
    await accountRequest('/progress', 'PUT', JSON.parse(snapshot), owner.token);
    if (localStorage.getItem(key) === snapshot) localStorage.removeItem(`${key}:pending`);
  });
  return saveQueue;
}
export async function signIn(mode, values) {
  const result = await accountRequest(`/${mode}`, 'POST', values);
  sessionStorage.setItem('doceasy-account', JSON.stringify(result));
  try {
    const remote = await accountRequest('/progress');
    const key = progressKey(result.user.id);
    if (localStorage.getItem(`${key}:pending`) && localStorage.getItem(key)) {
      await accountRequest('/progress', 'PUT', JSON.parse(localStorage.getItem(key)));
      localStorage.removeItem(`${key}:pending`);
    } else localStorage.setItem(key, JSON.stringify(remote));
    sessionStorage.setItem('doceasy-user-id', result.user.id);
  } catch (error) {
    sessionStorage.removeItem('doceasy-account');
    sessionStorage.removeItem('doceasy-user-id');
    throw error;
  }
}
export async function signOut() {
  const key = progressKey(account()?.user.id);
  if (localStorage.getItem(`${key}:pending`)) {
    await syncProgress(JSON.parse(localStorage.getItem(key) || '{}'));
  }
  await saveQueue.catch(() => {});
  await accountRequest('/logout', 'POST');
  sessionStorage.removeItem('doceasy-account');
  sessionStorage.removeItem('doceasy-user-id');
  window.location.assign('/login');
}
