import { en } from 'shared';
import { useAuth } from '@/auth/AuthProvider';
import { AccountCard } from '@/components/AccountCard';
import { Body, Button, Screen, Title } from '@/components/ui';

/** Admins and vendors use the web dashboard, not the mobile app. */
export default function StaffScreen() {
  const { user, signOut } = useAuth();
  if (!user) return null;
  return (
    <Screen>
      <Title>{en.home.staffTitle}</Title>
      <Body muted>{en.home.staffSubtitle}</Body>
      <AccountCard user={user} />
      <Button variant="secondary" label={en.common.logOut} onPress={() => void signOut()} />
    </Screen>
  );
}
