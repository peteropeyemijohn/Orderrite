import { en } from 'shared';
import { useAuth } from '@/auth/AuthProvider';
import { AccountCard } from '@/components/AccountCard';
import { Button } from '@/components/Button';
import { Screen, Title } from '@/components/ui';

/** The customer's account: who is signed in, and log out. */
export function AccountScreen() {
  const { user, signOut } = useAuth();
  if (!user) return null;
  return (
    <Screen withTabBar>
      <Title>{en.account.title}</Title>
      <AccountCard user={user} />
      <Button variant="danger" icon="log-out-outline" label={en.common.logOut} onPress={() => void signOut()} />
    </Screen>
  );
}
