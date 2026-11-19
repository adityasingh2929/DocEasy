// Optional on-device library. Nothing is saved unless the learner chooses Save.
const NAME = 'doceasy-document-library';
async function database() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(`${NAME}:${sessionStorage.getItem('doceasy-user-id') || 'guest'}`, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('documents', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Local library is unavailable in this browser.'));
  });
}
async function transaction(mode, action) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('documents', mode);
    const request = action(tx.objectStore('documents'));
    tx.oncomplete = () => { db.close(); resolve(request.result); };
    tx.onerror = () => { db.close(); reject(new Error('Could not update local library. Storage may be full.')); };
    tx.onabort = tx.onerror;
  });
}
export const listDocuments = () => transaction('readonly', store => store.getAll());
export const saveDocument = record => transaction('readwrite', store => store.put(record));
export const removeDocument = id => transaction('readwrite', store => store.delete(id));
