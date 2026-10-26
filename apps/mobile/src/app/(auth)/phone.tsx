import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { authErrorMessage, DIAL_COUNTRIES, en, internationalNumber, type DialCountry, type RequestCodeResponse } from 'shared';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { CountryPicker } from '@/components/CountryPicker';
import { LoginHero } from '@/components/LoginHero';
import { Body, ErrorText, ErrorView, Input, LoadingView, Screen, Title } from '@/components/ui';
import { usePublicConfig } from '@/config/usePublicConfig';
import { apiRequest, errorBody } from '@/lib/api';
import { useSlowHint } from '@/lib/useSlowHint';
import { useStyles } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';

export default function PhoneScreen() {
  const styles = useStyles(makeStyles);
  const { state, reload } = usePublicConfig();
  const [country, setCountry] = useState<DialCountry | null>(null);
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slow = useSlowHint(sending);

  if (state.status === 'loading') return <LoadingView />;
  if (state.status === 'error') return <ErrorView message={en.common.cantReachServer} onRetry={reload} />;
  const { defaultCountry, demo } = state.config;
  const activeCountries = state.config.countries ?? [defaultCountry];
  // The default country (from data) is pre-selected; +234 at launch.
  const selected = country ?? DIAL_COUNTRIES.find((c) => c.code === defaultCountry.code) ?? defaultCountry;

  const sendCode = async (input: string) => {
    setSending(true);
    setError(null);
    try {
      const result = await apiRequest<RequestCodeResponse>('/auth/otp/request', { method: 'POST', body: { phone: input } });
      router.push({ pathname: '/code', params: { phone: result.phone, resendIn: String(result.resendInSeconds) } });
    } catch (e) {
      setError(authErrorMessage(errorBody(e)));
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen hero>
      {/* White status bar icons over the violet hero (light screens use dark icons). */}
      <StatusBar style="light" />
      <LoginHero />

      <View style={styles.sheet}>
        <View style={styles.heading}>
          <Title>{en.auth.phoneTitle}</Title>
          <Body muted>{en.auth.phoneHint}</Body>
        </View>

        {/* One label for the whole row (country + number), so both line up. */}
        <View style={styles.phoneGroup}>
          <AppText variant="label" tone="muted" nativeID="phone-label">
            {en.auth.phoneLabel}
          </AppText>
          <View style={styles.row} accessibilityLabelledBy="phone-label">
            <CountryPicker value={selected} active={activeCountries} onChange={setCountry} />
            <View style={styles.flex}>
              <Input
                accessibilityLabel={en.auth.phoneLabel}
                accessibilityLabelledBy="phone-label"
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
        </View>

        {error && <ErrorText>{error}</ErrorText>}
        {slow && <Body muted>{en.common.firstLoadSlow}</Body>}
        <Button
          label={sending ? en.auth.sending : en.auth.sendCode}
          onPress={() => void sendCode(internationalNumber(phone, selected, defaultCountry.code))}
          loading={sending}
          disabled={phone.trim().length < 6}
          size="lg"
        />
        {__DEV__ && !demo && <Body muted>{en.auth.devCodeHint}</Body>}

        {demo && (
          <View style={styles.demo}>
            <AppText variant="heading">{en.auth.tryDemo}</AppText>
            <AppText variant="label" tone="muted">
              {en.auth.tryDemoHint} {demo.code}.
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
      </View>
    </Screen>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    // White sheet with rounded top corners, overlapping the bottom of the hero.
    sheet: {
      flexGrow: 1,
      marginTop: -theme.sizes.sheetOverlap,
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      paddingHorizontal: theme.screenPadding,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.screenBottom,
      gap: theme.spacing.md,
    },
    heading: { gap: theme.spacing.xxs },
    phoneGroup: { gap: theme.spacing.xxs },
    row: { flexDirection: 'row', alignItems: 'stretch', gap: theme.spacing.xs },
    flex: { flex: 1 },
    demo: {
      gap: theme.spacing.xs,
      marginTop: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    devLink: { alignSelf: 'center', paddingVertical: theme.spacing.sm, minHeight: theme.minTap },
  });
