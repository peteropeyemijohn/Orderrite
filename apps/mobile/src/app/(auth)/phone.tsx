import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { authErrorMessage, en, type RequestCodeResponse } from 'shared';
import { Body, Button, DemoBanner, ErrorText, ErrorView, Input, LoadingView, Screen, Title } from '@/components/ui';
import { usePublicConfig } from '@/config/usePublicConfig';
import { apiRequest, errorBody } from '@/lib/api';
import { plain } from '@/theme/plain';

export default function PhoneScreen() {
  const { state, reload } = usePublicConfig();
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (state.status === 'loading') return <LoadingView />;
  if (state.status === 'error') return <ErrorView message={en.common.cantReachServer} onRetry={reload} />;
  const { defaultCountry, demo } = state.config;

  const sendCode = async (input: string) => {
    setSending(true);
    setError(null);
    try {
      // Numbers without "+" are read by the API using the default country.
      const result = await apiRequest<RequestCodeResponse>('/auth/otp/request', { method: 'POST', body: { phone: input } });
      router.push({ pathname: '/code', params: { phone: result.phone, resendIn: String(result.resendInSeconds) } });
    } catch (e) {
      setError(authErrorMessage(errorBody(e)));
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen>
      {demo && <DemoBanner code={demo.code} />}
      <Title>{en.auth.phoneTitle}</Title>
      <Body muted>{en.auth.phoneHint}</Body>

      <View style={styles.row}>
        <Text style={styles.dialCode}>{defaultCountry.dialCode}</Text>
        <View style={styles.flex}>
          <Input
            label={en.auth.phoneLabel}
            value={phone}
            onChangeText={setPhone}
            placeholder={en.auth.phonePlaceholder}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            maxLength={20}
          />
        </View>
      </View>

      {error && <ErrorText>{error}</ErrorText>}
      <Button label={sending ? en.auth.sending : en.auth.sendCode} onPress={() => void sendCode(phone)} disabled={sending || phone.trim().length < 6} />
      {__DEV__ && !demo && <Body muted>{en.auth.devCodeHint}</Body>}

      {demo && (
        <View style={styles.demoAccounts}>
          <Body muted>{en.auth.demoAccounts}</Body>
          {demo.accounts.map((account) => (
            <Button
              key={account.phone}
              variant="secondary"
              label={`${en.auth.demoRole[account.role]} · ${account.phone}`}
              onPress={() => void sendCode(account.phone)}
              disabled={sending}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: plain.space.sm },
  dialCode: { fontSize: plain.font.body, color: plain.color.text, paddingBottom: plain.space.md + 1, fontWeight: '600' },
  flex: { flex: 1 },
  demoAccounts: { gap: plain.space.sm, marginTop: plain.space.md },
});
