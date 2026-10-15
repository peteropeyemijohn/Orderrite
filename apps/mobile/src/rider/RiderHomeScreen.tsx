import { en } from 'shared';
import { useAuth } from '@/auth/AuthProvider';
import { AccountCard } from '@/components/AccountCard';
import { Body, Button, Screen, Title } from '@/components/ui';

/**
 * Placeholder rider home. The rider flow comes in Phase 7.
 * Rider code lives in src/rider so it can be split into its own app later.
 */
export function RiderHomeScreen() {
  const { user, signOut } = useAuth();
  if (!user) return null;
  return (
    <Screen>
      <Title>{en.home.riderTitle}</Title>
      <Body muted>{en.home.riderSubtitle}</Body>
      <AccountCard user={user} />
      <Button variant="secondary" label={en.common.logOut} onPress={() => void signOut()} />
    </Screen>
  );
}
