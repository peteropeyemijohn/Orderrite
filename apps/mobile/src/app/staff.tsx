import { en } from 'shared';
import { useAuth } from '@/auth/AuthProvider';
import { AccountCard } from '@/components/AccountCard';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/States';
import { Screen } from '@/components/ui';

/** Admins and vendors use the web dashboard, not the mobile app. */
export default function StaffScreen() {
  const { user, signOut } = useAuth();
  if (!user) return null;
  return (
    <Screen centered>
      <EmptyState icon="desktop-outline" title={en.home.staffTitle} body={en.home.staffSubtitle} />
      <AccountCard user={user} />
      <Button variant="danger" icon="log-out-outline" label={en.common.logOut} onPress={() => void signOut()} />
    </Screen>
  );
}
