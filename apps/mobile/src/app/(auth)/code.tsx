import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { authErrorMessage, en, type RequestCodeResponse, type SessionResponse } from 'shared';
import { useAuth } from '@/auth/AuthProvider';
import { Body, Button, ErrorText, Input, Screen, Title } from '@/components/ui';
import { apiRequest, errorBody } from '@/lib/api';
import { useSlowHint } from '@/lib/useSlowHint';

export default function CodeScreen() {
  const params = useLocalSearchParams<{ phone: string; resendIn?: string }>();
  const phone = params.phone ?? '';
  const { signIn } = useAuth();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(Number(params.resendIn ?? 60));
  const slow = useSlowHint(busy);

  // Countdown until a new code can be requested.
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const verify = async () => {
    setBusy(true);
    setError(null);
    try {
      const session = await apiRequest<SessionResponse>('/auth/otp/verify', { method: 'POST', body: { phone, code } });
      await signIn(session);
      router.replace('/');
    } catch (e) {
      setError(authErrorMessage(errorBody(e)));
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await apiRequest<RequestCodeResponse>('/auth/otp/request', { method: 'POST', body: { phone } });
      setResendIn(result.resendInSeconds);
    } catch (e) {
      const body = errorBody(e);
      if (body?.retryAfterSeconds) setResendIn(body.retryAfterSeconds);
      setError(authErrorMessage(body));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Title>{en.auth.codeTitle}</Title>
      <Body muted>{en.auth.codeSentTo(phone)}</Body>
      <Input
        label={en.auth.codeLabel}
        value={code}
        onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        autoComplete="sms-otp"
        textContentType="oneTimeCode"
        maxLength={6}
        autoFocus
      />
      {error && <ErrorText>{error}</ErrorText>}
      {slow && <Body muted>{en.common.firstLoadSlow}</Body>}
      <Button label={busy ? en.auth.verifying : en.auth.verify} onPress={() => void verify()} disabled={busy || code.length !== 6} />
      <Button
        variant="secondary"
        label={resendIn > 0 ? en.auth.resendIn(resendIn) : en.auth.resend}
        onPress={() => void resend()}
        disabled={busy || resendIn > 0}
      />
      <Button variant="secondary" label={en.auth.changeNumber} onPress={() => router.back()} disabled={busy} />
    </Screen>
  );
}
