import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

export interface TabItem {
  key: string;
  label: string;
  icon: IconName;
  iconActive: IconName;
  /** Small count bubble, e.g. items in the cart */
  badge?: number;
}

/** The look of the bottom tab bar (used by the real tabs and the preview). */
export function TabBarView({
  items,
  activeKey,
  onSelect,
  bottomInset = 0,
}: {
  items: TabItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  bottomInset?: number;
}) {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(bottomInset, theme.spacing.xs) }]} accessibilityRole="tablist">
      {items.map((item) => {
        const active = item.key === activeKey;
        const color = active ? theme.colors.primary : theme.colors.textMuted;
        return (
          <PressableScale
            key={item.key}
            onPress={() => onSelect(item.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.badge ? `${item.label}, ${item.badge}` : item.label}
            style={styles.item}
          >
            <View style={[styles.iconPill, active && { backgroundColor: theme.colors.primarySoft }]}>
              <Icon name={active ? item.iconActive : item.icon} size="lg" color={color} />
              {item.badge ? (
                <View style={styles.badge}>
                  <AppText variant="caption" tone="onPrimary">
                    {item.badge > 9 ? '9+' : item.badge}
                  </AppText>
                </View>
              ) : null}
            </View>
            <AppText variant="caption" style={{ color }} numberOfLines={1}>
              {item.label}
            </AppText>
          </PressableScale>
        );
      })}
    </View>
  );
}

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/** Connects TabBarView to Expo Router's tabs. Icons come from each screen's options. */
export function makeTabBar(icons: Record<string, { icon: IconName; iconActive: IconName }>) {
  return function AppTabBar({ state, descriptors, navigation, insets }: TabBarProps) {
    const items: TabItem[] = state.routes.map((route) => {
      const options = descriptors[route.key]?.options;
      const badge = options?.tabBarBadge;
      return {
        key: route.key,
        label: typeof options?.title === 'string' ? options.title : route.name,
        icon: icons[route.name]?.icon ?? 'ellipse-outline',
        iconActive: icons[route.name]?.iconActive ?? 'ellipse',
        badge: typeof badge === 'number' ? badge : undefined,
      };
    });
    return (
      <TabBarView
        items={items}
        activeKey={state.routes[state.index]?.key ?? ''}
        bottomInset={insets.bottom}
        onSelect={(key) => {
          const route = state.routes.find((r) => r.key === key);
          if (!route) return;
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!event.defaultPrevented && state.routes[state.index]?.key !== key) navigation.navigate(route.name);
        }}
      />
    );
  };
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      paddingTop: theme.spacing.xs,
      paddingHorizontal: theme.spacing.xs,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      ...theme.shadows.up,
    },
    item: { flex: 1, alignItems: 'center', gap: theme.sizes.nudge, minHeight: Math.max(theme.minTap, theme.sizes.tabItem), justifyContent: 'center' },
    iconPill: {
      minWidth: theme.sizes.tabIndicatorWidth,
      height: theme.sizes.tabIndicatorHeight,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute',
      top: -theme.sizes.nudge,
      right: theme.spacing.xs,
      minWidth: theme.sizes.countBadge,
      height: theme.sizes.countBadge,
      paddingHorizontal: theme.spacing.xxs,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
