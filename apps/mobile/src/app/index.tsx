import { Redirect } from 'expo-router';
import { en } from 'shared';
import { useAuth } from '@/auth/AuthProvider';
import { ErrorView, LoadingView } from '@/components/ui';

/** Start screen: sends each person to the right place. */
export default function Index() {
  const { status, user, retry } = useAuth();

  if (status === 'loading') return <LoadingView />;
  if (status === 'error') return <ErrorView message={en.common.cantReachServer} onRetry={retry} />;
  if (status === 'signedOut' || !user) return <Redirect href="/phone" />;

  switch (user.role) {
    case 'CUSTOMER':
      return <Redirect href="/home" />;
    case 'RIDER':
      return <Redirect href="/deliveries" />;
    default:
      return <Redirect href="/staff" />;
  }
}
