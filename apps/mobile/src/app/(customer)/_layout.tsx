import { Tabs } from 'expo-router';
import { en } from 'shared';
import { makeTabBar } from '@/components/TabBar';

// Icons for each tab: outline when inactive, filled when active.
const AppTabBar = makeTabBar({
  home: { icon: 'home-outline', iconActive: 'home' },
  orders: { icon: 'receipt-outline', iconActive: 'receipt' },
  cart: { icon: 'bag-handle-outline', iconActive: 'bag-handle' },
  account: { icon: 'person-circle-outline', iconActive: 'person-circle' },
});

/** The customer area: Home, Orders, Cart, Account. */
export default function CustomerTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <AppTabBar {...props} />}>
      <Tabs.Screen name="home" options={{ title: en.tabs.home }} />
      <Tabs.Screen name="orders" options={{ title: en.tabs.orders }} />
      <Tabs.Screen name="cart" options={{ title: en.tabs.cart }} />
      <Tabs.Screen name="account" options={{ title: en.tabs.account }} />
    </Tabs>
  );
}
