import { useEffect, useState } from 'react';
import { account, syncProgress } from '../utils/account';
import { getProgress } from '../utils/progress';

export default function ProgressSync() {
  const [status, setStatus] = useState('');
  useEffect(() => {
    let timer, active = true;
    const sync = () => {
      if (!account()) return;
      clearTimeout(timer);
      setStatus('Saving progress…');
      timer = setTimeout(() => {
        const progress = getProgress();
        syncProgress(progress)
          .then(() => {
            if (active) setStatus('Progress saved');
          })
          .catch(() => { if (active) setStatus('Saved on this device. Click to retry cloud sync.'); });
      }, 250);
    };
    window.addEventListener('doceasy-progress', sync);
    window.addEventListener('online', sync);
    window.addEventListener('doceasy-retry-sync', sync);
    return () => { active = false; clearTimeout(timer); window.removeEventListener('doceasy-progress', sync); window.removeEventListener('online', sync); window.removeEventListener('doceasy-retry-sync', sync); };
  }, []);
  return status && account() ? <button className="sync-status" onClick={() => window.dispatchEvent(new Event('doceasy-retry-sync'))} aria-live="polite">{status}</button> : null;
}
