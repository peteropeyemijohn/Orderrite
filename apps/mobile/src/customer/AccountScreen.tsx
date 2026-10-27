import { en } from 'shared';
import { useAuth } from '@/auth/AuthProvider';
import { AccountCard } from '@/components/AccountCard';
import { LogOutButton } from '@/components/LogOutButton';
import { Screen, Title } from '@/components/ui';

/** The customer's account: who is signed in, and log out. */
export function AccountScreen() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <Screen withTabBar>
      <Title>{en.account.title}</Title>
      <AccountCard user={user} />
      <LogOutButton />
    </Screen>
  );
}
