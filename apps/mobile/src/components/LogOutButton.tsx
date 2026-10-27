import { useState } from 'react';
import { en } from 'shared';
import { useAuth } from '@/auth/AuthProvider';
import { Button } from './Button';
import { ConfirmDialog } from './ConfirmDialog';

/** The Log out button, which asks "Log out?" first. */
export function LogOutButton() {
  const { signOut } = useAuth();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await signOut(); // the app then switches to the login screens
    } finally {
      setBusy(false);
      setAsking(false);
    }
  };

  return (
    <>
      <Button variant="danger" icon="log-out-outline" label={en.common.logOut} onPress={() => setAsking(true)} />
      <ConfirmDialog
        visible={asking}
        title={en.account.logOutTitle}
        body={en.account.logOutBody}
        confirmLabel={en.common.logOut}
        cancelLabel={en.common.cancel}
        confirmVariant="danger"
        loading={busy}
        onConfirm={() => void confirm()}
        onCancel={() => !busy && setAsking(false)}
      />
    </>
  );
}
