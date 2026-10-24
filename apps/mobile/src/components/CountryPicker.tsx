import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { en, flagEmoji, pickerCountries, type DialCountry, type PublicCountry } from 'shared';
import { useStyles, useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

type Row = { type: 'header'; title: string } | { type: 'country'; country: DialCountry };

/**
 * The phone number's country: a button showing the flag and dialling code,
 * which opens a sheet with every country. Countries Orderrite operates in
 * (from the API) come first; the default (+234 at launch) is pre-selected.
 */
export function CountryPicker({
  value,
  active,
  onChange,
}: {
  value: DialCountry;
  active: PublicCountry[];
  onChange: (country: DialCountry) => void;
}) {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const rows = useMemo<Row[]>(() => {
    const { active: first, others } = pickerCountries(active);
    const q = query.trim().toLowerCase();
    const match = (c: DialCountry) => !q || c.name.toLowerCase().includes(q) || c.dialCode.includes(q.replace(/^\+?/, '+'));
    const firstRows = first.filter(match);
    const otherRows = others.filter(match);
    return [
      ...(firstRows.length ? [{ type: 'header' as const, title: en.auth.operatingIn }, ...firstRows.map((country) => ({ type: 'country' as const, country }))] : []),
      ...(otherRows.length ? [{ type: 'header' as const, title: en.auth.allCountries }, ...otherRows.map((country) => ({ type: 'country' as const, country }))] : []),
    ];
  }, [active, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <PressableScale
        onPress={() => setOpen(true)}
        accessibilityLabel={en.auth.countryPicker(value.name, value.dialCode)}
        style={styles.button}
      >
        <AppText style={styles.flag}>{flagEmoji(value.code)}</AppText>
        <AppText variant="bodyStrong">{value.dialCode}</AppText>
        <Icon name="chevron-down" size="sm" color={theme.colors.textMuted} />
      </PressableScale>

      <Modal visible={open} animationType="slide" transparent onRequestClose={close} statusBarTranslucent navigationBarTranslucent>
        <Pressable style={styles.backdrop} onPress={close} accessibilityLabel={en.preview.close} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + theme.spacing.md }]}>
          <View style={styles.handle} />
          <AppText variant="heading" accessibilityRole="header">
            {en.auth.chooseCountry}
          </AppText>
          <View style={styles.search}>
            <Icon name="search" size="md" color={theme.colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={en.auth.searchCountries}
              placeholderTextColor={theme.colors.textSubtle}
              style={[theme.text.body, styles.searchInput]}
              autoCorrect={false}
            />
          </View>
          <FlatList
            data={rows}
            keyExtractor={(row, i) => (row.type === 'header' ? `h-${row.title}` : row.country.code) + i}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={20}
            renderItem={({ item }) =>
              item.type === 'header' ? (
                <AppText variant="label" tone="muted" style={styles.sectionTitle}>
                  {item.title}
                </AppText>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: item.country.code === value.code }}
                  onPress={() => {
                    onChange(item.country);
                    close();
                  }}
                  style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.colors.surfaceMuted }]}
                >
                  <AppText style={styles.flag}>{flagEmoji(item.country.code)}</AppText>
                  <AppText style={styles.flex} numberOfLines={1}>
                    {item.country.name}
                  </AppText>
                  <AppText tone="muted">{item.country.dialCode}</AppText>
                  {item.country.code === value.code && <Icon name="checkmark" size="md" color={theme.colors.primary} />}
                </Pressable>
              )
            }
          />
        </View>
      </Modal>
    </>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      minHeight: Math.max(theme.minTap, theme.sizes.input),
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radius.md,
      borderWidth: theme.sizes.inputBorder,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    flag: { fontSize: theme.sizes.flag, lineHeight: theme.sizes.flag + theme.spacing.xxs },
    backdrop: { flex: 1, backgroundColor: theme.colors.scrim },
    sheet: {
      maxHeight: '80%',
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      paddingHorizontal: theme.screenPadding,
      paddingTop: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    handle: {
      alignSelf: 'center',
      width: theme.spacing.xxl,
      height: theme.spacing.xxs,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.border,
    },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      minHeight: Math.max(theme.minTap, theme.sizes.input),
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceMuted,
    },
    searchInput: { flex: 1, color: theme.colors.text, paddingVertical: 0 },
    sectionTitle: { marginTop: theme.spacing.sm, marginBottom: theme.spacing.xxs },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      minHeight: Math.max(theme.minTap, theme.sizes.buttonMd),
      paddingHorizontal: theme.spacing.xs,
      borderRadius: theme.radius.md,
    },
    flex: { flex: 1 },
  });
