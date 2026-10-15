import { useEffect, useState } from 'react';

/**
 * True when something has been busy for more than 5 seconds. Used to explain
 * that the free server may be waking up (this can take up to a minute).
 */
export function useSlowHint(busy: boolean, afterMs = 5000): boolean {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!busy) return;
    const timer = setTimeout(() => setSlow(true), afterMs);
    return () => {
      clearTimeout(timer);
      setSlow(false);
    };
  }, [busy, afterMs]);
  return busy && slow;
}
