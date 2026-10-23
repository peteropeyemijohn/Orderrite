import { Suspense } from 'react';
import { en } from 'shared';
import { getCurrentStaffUser } from '@/lib/current-user';
import { logout } from './actions';

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      {/* Reading the session happens per request, so it streams in behind Suspense. */}
      <Suspense fallback={<p className="text-muted">{en.common.loading}</p>}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}

/** Placeholder dashboard. The real admin panel and vendor dashboard come in Phase 4. */
async function DashboardContent() {
  const user = await getCurrentStaffUser();
  const isAdmin = user.role === 'ADMIN';

  return (
    <>
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{isAdmin ? en.dashboard.adminWelcome : `${en.dashboard.vendorWelcome}, ${user.name ?? ''}`}</h1>
        <form action={logout}>
          <button className="rounded-full border border-border bg-surface px-4 py-2 font-semibold" type="submit">
            {en.common.logOut}
          </button>
        </form>
      </header>
      <p className="text-muted">{isAdmin ? en.dashboard.adminSubtitle : en.dashboard.vendorSubtitle}</p>
      <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 rounded-card bg-surface p-4 shadow-soft">
        <dt className="text-muted">{en.home.signedInAs}</dt>
        <dd>{user.name ?? user.phone}</dd>
        <dt className="text-muted">{en.home.phone}</dt>
        <dd>{user.phone}</dd>
        <dt className="text-muted">{en.home.role}</dt>
        <dd className="font-semibold">{user.role}</dd>
      </dl>
    </>
  );
}
