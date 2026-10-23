import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { authErrorMessage, en, type RequestCodeResponse } from 'shared';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Body, DemoBanner, ErrorText, ErrorView, Input, LoadingView, Screen, Title } from '@/components/ui';
import { usePublicConfig } from '@/config/usePublicConfig';
import { apiRequest, errorBody } from '@/lib/api';
import { useSlowHint } from '@/lib/useSlowHint';
import { useStyles } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';

export default function PhoneScreen() {
  const styles = useStyles(makeStyles);
  const { state, reload } = usePublicConfig();
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slow = useSlowHint(sending);

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
      <View style={styles.header}>
        <AppText variant="display" tone="primary">
          {en.appName}
        </AppText>
        <Title>{en.auth.phoneTitle}</Title>
        <Body muted>{en.auth.phoneHint}</Body>
      </View>

      <View style={styles.row}>
        <View style={styles.dialCode}>
          <AppText variant="bodyStrong">{defaultCountry.dialCode}</AppText>
        </View>
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
      {slow && <Body muted>{en.common.firstLoadSlow}</Body>}
      <Button label={sending ? en.auth.sending : en.auth.sendCode} onPress={() => void sendCode(phone)} loading={sending} disabled={phone.trim().length < 6} size="lg" />
      {__DEV__ && !demo && <Body muted>{en.auth.devCodeHint}</Body>}

      {demo && (
        <View style={styles.demoAccounts}>
          <AppText variant="label" tone="muted">
            {en.auth.demoAccounts}
          </AppText>
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

      {__DEV__ && (
        <Link href="/dev-preview" style={styles.devLink}>
          <AppText variant="label" tone="primary">
            {en.preview.openLink}
          </AppText>
        </Link>
      )}
    </Screen>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    header: { gap: theme.spacing.xs, marginTop: theme.spacing.md, marginBottom: theme.spacing.xs },
    row: { flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.xs },
    dialCode: {
      minHeight: Math.max(theme.minTap, theme.sizes.input),
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceMuted,
      justifyContent: 'center',
    },
    flex: { flex: 1 },
    demoAccounts: { gap: theme.spacing.xs, marginTop: theme.spacing.md },
    devLink: { alignSelf: 'center', paddingVertical: theme.spacing.sm, minHeight: theme.minTap },
  });
