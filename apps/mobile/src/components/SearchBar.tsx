import { StyleSheet, TextInput, View } from 'react-native';
import { useStyles, useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

/**
 * Rounded search bar. With onPress it acts as a button that opens search
 * (the usual pattern on a home screen); with onChangeText it is a real input.
 */
export function SearchBar({
  placeholder,
  value,
  onChangeText,
  onPress,
}: {
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  const icon = <Icon name="search" size="md" color={theme.colors.textMuted} />;

  if (onPress) {
    return (
      <PressableScale onPress={onPress} accessibilityLabel={placeholder} accessibilityRole="search" style={[styles.bar, theme.shadows.sm]}>
        {icon}
        <AppText tone="subtle" numberOfLines={1}>
          {placeholder}
        </AppText>
      </PressableScale>
    );
  }
  return (
    <View style={[styles.bar, theme.shadows.sm]}>
      {icon}
      <TextInput
        style={[theme.text.body, styles.input]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSubtle}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        accessibilityRole="search"
      />
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      minHeight: Math.max(theme.minTap, theme.sizes.searchBar),
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface,
    },
    input: { flex: 1, color: theme.colors.text, paddingVertical: 0 },
  });
