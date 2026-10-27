import type { Tabs } from 'expo-router';
import { useEffect, useRef, useState, type ComponentProps } from 'react';
import type { LayoutRectangle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
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

/**
 * The bottom tab bar: equal-width tabs and one rounded pill that slides to
 * the active tab with a soft spring (it jumps when Reduce Motion is on).
 */
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
  const reduceMotion = useReducedMotion();
  const activeIndex = Math.max(0, items.findIndex((item) => item.key === activeKey));
  // Each tab reports where it really is on screen; the pill centres on the active one.
  const [layouts, setLayouts] = useState<Record<string, LayoutRectangle>>({});
  const activeLayout = layouts[items[activeIndex]?.key ?? ''];
  const pillX = useSharedValue(0);
  const placed = useRef(false);

  useEffect(() => {
    if (!activeLayout) return;
    const target = activeLayout.x + (activeLayout.width - theme.sizes.tabIndicatorWidth) / 2;
    // First placement (and Reduce Motion) jumps; later changes slide with a spring.
    pillX.set(reduceMotion || !placed.current ? target : withSpring(target, theme.motion.spring));
    placed.current = true;
  }, [activeLayout, reduceMotion, pillX, theme]);

  const pillStyle = useAnimatedStyle(() => ({ transform: [{ translateX: pillX.value }] }));

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(bottomInset, theme.spacing.xs) }]} accessibilityRole="tablist">
      <View style={styles.row}>
        {activeLayout && <Animated.View style={[styles.pill, pillStyle]} pointerEvents="none" />}
        {items.map((item, index) => {
          const active = index === activeIndex;
          const color = active ? theme.colors.primary : theme.colors.textMuted;
          return (
            <PressableScale
              key={item.key}
              onLayout={(e) => {
                const layout = e.nativeEvent.layout;
                setLayouts((current) => (current[item.key]?.x === layout.x && current[item.key]?.width === layout.width ? current : { ...current, [item.key]: layout }));
              }}
              onPress={() => onSelect(item.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={item.badge ? `${item.label}, ${item.badge}` : item.label}
              style={styles.item}
            >
              <View style={styles.iconBox}>
                <Icon name={active ? item.iconActive : item.icon} size="lg" color={color} />
                {item.badge ? (
                  <View style={styles.badge}>
                    <AppText variant="caption" tone="onPrimary">
                      {item.badge > 9 ? '9+' : item.badge}
                    </AppText>
                  </View>
                ) : null}
              </View>
              <AppText variant="caption" tone={active ? 'primary' : 'muted'} numberOfLines={1}>
                {item.label}
              </AppText>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/** Connects TabBarView to Expo Router's tabs. Icons are given per route name. */
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
      backgroundColor: theme.colors.surface,
      paddingTop: theme.spacing.xs,
      paddingHorizontal: theme.spacing.xs,
      // A full 1 px line (a hairline is too thin to see on sharp screens) plus a soft shadow.
      borderTopWidth: theme.sizes.divider,
      borderTopColor: theme.colors.divider,
      ...theme.shadows.up,
    },
    row: { flexDirection: 'row' },
    // The sliding pill sits behind the active tab's icon.
    pill: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: theme.sizes.tabIndicatorWidth,
      height: theme.sizes.tabIndicatorHeight,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primarySoft,
    },
    // Each tab takes an equal quarter (flex: 1 of 4); a small gap separates icon and label.
    item: { flex: 1, alignItems: 'center', gap: theme.spacing.xxs, minHeight: Math.max(theme.minTap, theme.sizes.tabItem) },
    iconBox: { height: theme.sizes.tabIndicatorHeight, justifyContent: 'center', alignItems: 'center' },
    badge: {
      position: 'absolute',
      top: -theme.sizes.nudge,
      right: -theme.spacing.sm,
      minWidth: theme.sizes.countBadge,
      height: theme.sizes.countBadge,
      paddingHorizontal: theme.spacing.xxs,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
