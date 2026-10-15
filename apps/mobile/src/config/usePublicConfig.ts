import { useCallback, useEffect, useState } from 'react';
import type { PublicConfig } from 'shared';
import { apiRequest } from '@/lib/api';

type State = { status: 'loading' } | { status: 'ready'; config: PublicConfig } | { status: 'error' };

/** Loads GET /config/public (default country, demo details). */
export function usePublicConfig() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    apiRequest<PublicConfig>('/config/public')
      .then((config) => active && setState({ status: 'ready', config }))
      .catch(() => active && setState({ status: 'error' }));
    return () => {
      active = false;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return { state, reload };
}
