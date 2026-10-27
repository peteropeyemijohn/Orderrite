import { StyleSheet, View } from 'react-native';
import { en, formatPhone, type AuthUser } from 'shared';
import { useStyles, useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';
import { AppText } from './AppText';
import { Card } from './Card';
import { Icon } from './Icon';

/** Shows who is signed in: name, phone number, and a chip on demo accounts. */
export function AccountCard({ user }: { user: AuthUser }) {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  const phone = formatPhone(user.phone);
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Icon name="person" size="lg" color={theme.colors.primary} />
        </View>
        <View style={styles.flex}>
          <AppText variant="heading" numberOfLines={1}>
            {user.name ?? phone}
          </AppText>
          {user.name && (
            <AppText variant="label" tone="muted">
              {phone}
            </AppText>
          )}
          {user.isDemo && (
            <View style={styles.chip}>
              <Icon name="flask-outline" size="sm" color={theme.colors.primary} />
              <AppText variant="caption" tone="primary">
                {en.account.demoChip}
              </AppText>
            </View>
          )}
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
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: theme.spacing.xxs,
      marginTop: theme.spacing.xxs,
      backgroundColor: theme.colors.primarySoft,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.sizes.nudge,
    },
  });
