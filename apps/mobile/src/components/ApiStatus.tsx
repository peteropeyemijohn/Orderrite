import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { en } from 'shared';
import { API_URL } from '@/lib/api';

type Status = 'checking' | 'connected' | 'error';

/** Asks the API's /health endpoint whether everything is running. */
async function fetchHealth(): Promise<Status> {
  try {
    const res = await fetch(`${API_URL}/health`);
    const body = (await res.json()) as { status?: string };
    return res.ok && body.status === 'ok' ? 'connected' : 'error';
  } catch {
    return 'error';
  }
}

/** Calls GET /health on the API and shows whether it answered. */
export function ApiStatus() {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    let active = true;
    void fetchHealth().then((result) => {
      if (active) setStatus(result);
    });
    return () => {
      active = false;
    };
  }, []);

  const retry = () => {
    setStatus('checking');
    void fetchHealth().then(setStatus);
  };

  if (status === 'checking') {
    return (
      <View style={styles.row}>
        <ActivityIndicator />
        <Text style={styles.muted}>{en.hello.apiChecking}</Text>
      </View>
    );
  }
  if (status === 'connected') {
    return <Text style={styles.ok}>{en.hello.apiConnected}</Text>;
  }
  return (
    <View style={styles.errorBox}>
      <Text style={styles.error}>{en.hello.apiError}</Text>
      <Text style={styles.muted}>{API_URL}</Text>
      <Pressable style={styles.button} onPress={retry}>
        <Text style={styles.buttonText}>{en.hello.retry}</Text>
      </Pressable>
    </View>
  );
}

// Temporary styles for the hello screen. The real theme file comes in Phase 3.
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  muted: { color: '#737373', fontSize: 14 },
  ok: { color: '#047857', fontSize: 18, fontWeight: '600' },
  errorBox: { alignItems: 'center', gap: 8 },
  error: { color: '#b91c1c', fontSize: 16, textAlign: 'center' },
  button: { backgroundColor: '#171717', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 10 },
  buttonText: { color: '#ffffff', fontWeight: '600' },
});
