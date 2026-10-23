import { StyleSheet, View } from 'react-native';
import { en, type AuthUser } from 'shared';
import { useStyles, useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';
import { AppText } from './AppText';
import { Card } from './Card';
import { Icon } from './Icon';

/** Shows who is signed in. */
export function AccountCard({ user }: { user: AuthUser }) {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Icon name="person" size="lg" color={theme.colors.primary} />
        </View>
        <View style={styles.flex}>
          <AppText variant="heading" numberOfLines={1}>
            {user.name ?? user.phone}
          </AppText>
          <AppText variant="label" tone="muted">
            {en.home.phone}: {user.phone}
          </AppText>
          <AppText variant="label" tone="muted">
            {en.home.role}: {user.role}
          </AppText>
        </View>
      </View>
    </Card>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
    avatar: {
      width: theme.sizes.avatar,
      height: theme.sizes.avatar,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    flex: { flex: 1, gap: theme.sizes.nudge },
  });
