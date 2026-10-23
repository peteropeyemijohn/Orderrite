import { router } from 'expo-router';
import { en } from 'shared';
import { EmptyState } from '@/components/States';
import { Screen, Title } from '@/components/ui';

/** Order history. Orders arrive in Phase 6; until then a friendly empty state. */
export function OrdersScreen() {
  return (
    <Screen withTabBar>
      <Title>{en.tabs.orders}</Title>
      <EmptyState
        icon="receipt-outline"
        title={en.orders.emptyTitle}
        body={en.orders.emptyBody}
        actionLabel={en.orders.emptyAction}
        onAction={() => router.navigate('/home')}
      />
    </Screen>
  );
}
