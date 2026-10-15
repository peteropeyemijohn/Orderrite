import { en } from 'shared';
import { useAuth } from '@/auth/AuthProvider';
import { AccountCard } from '@/components/AccountCard';
import { Body, Button, Screen, Title } from '@/components/ui';

/** Placeholder customer home. Browsing restaurants comes in Phase 5. */
export function CustomerHomeScreen() {
  const { user, signOut } = useAuth();
  if (!user) return null;
  return (
    <Screen>
      <Title>{en.home.customerTitle}</Title>
      <Body muted>{en.home.customerSubtitle}</Body>
      <AccountCard user={user} />
      <Button variant="secondary" label={en.common.logOut} onPress={() => void signOut()} />
    </Screen>
  );
}
