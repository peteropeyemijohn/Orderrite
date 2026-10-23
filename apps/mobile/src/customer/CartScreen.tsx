import { router } from 'expo-router';
import { en } from 'shared';
import { EmptyState } from '@/components/States';
import { Screen, Title } from '@/components/ui';

/** Cart. Adding dishes comes in Phase 5; until then a friendly empty state. */
export function CartScreen() {
  return (
    <Screen withTabBar>
      <Title>{en.tabs.cart}</Title>
      <EmptyState
        icon="bag-handle-outline"
        title={en.cart.emptyTitle}
        body={en.cart.emptyBody}
        actionLabel={en.cart.emptyAction}
        onAction={() => router.navigate('/home')}
      />
    </Screen>
  );
}
