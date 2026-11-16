import { useEffect, useState } from 'react';
import { getProgress } from './progress';

export function useProgress() {
  const [progress, setProgress] = useState(getProgress);
  useEffect(() => {
    const refresh = () => setProgress(getProgress());
    window.addEventListener('doceasy-progress', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('doceasy-progress', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return progress;
}
