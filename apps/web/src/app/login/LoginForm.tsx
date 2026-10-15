'use client';

import { useEffect, useState } from 'react';
import { en, type PublicConfig } from 'shared';
import { useSlowHint } from '@/lib/useSlowHint';
import { loadPublicConfig, requestCode, verifyCode } from './actions';

type Step = { name: 'phone' } | { name: 'code'; phone: string };

const button = 'w-full rounded-2xl bg-neutral-900 py-3 font-semibold text-white disabled:opacity-50';
const secondaryButton = 'w-full rounded-2xl border border-neutral-300 py-3 font-semibold disabled:opacity-50';
const input = 'w-full rounded-2xl border border-neutral-300 p-3 text-base';

export function LoginForm() {
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [slow, setSlow] = useState(false);

  const [step, setStep] = useState<Step>({ name: 'phone' });
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const slowAction = useSlowHint(busy);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => active && setSlow(true), 5000);
    void loadPublicConfig().then((result) => {
      if (!active) return;
      if (result.ok) setConfig(result.data);
      else setConfigError(result.message);
    });
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [attempt]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  if (configError) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-red-700" role="alert">{configError}</p>
        <button
          className={button}
          onClick={() => {
            setConfigError(null);
            setSlow(false);
            setAttempt((n) => n + 1);
          }}
        >
          {en.common.retry}
        </button>
      </div>
    );
  }
  if (!config) {
    return <p className="text-neutral-500">{slow ? en.common.firstLoadSlow : en.common.loading}</p>;
  }

  const sendCode = async (input: string) => {
    setBusy(true);
    setError(null);
    const result = await requestCode(input);
    setBusy(false);
    if (result.ok) {
      setStep({ name: 'code', phone: result.data.phone });
      setCode('');
      setResendIn(result.data.resendInSeconds);
    } else {
      setError(result.message);
      if (result.retryAfterSeconds) setResendIn(result.retryAfterSeconds);
    }
  };

  const submitCode = async (currentPhone: string) => {
    setBusy(true);
    setError(null);
    // On success the server action redirects to /dashboard.
    const result = await verifyCode(currentPhone, code);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      setCode('');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {config.demo && (
        <p className="rounded-2xl bg-amber-100 p-4 font-semibold text-amber-900">{en.auth.demoBanner(config.demo.code)}</p>
      )}
      {slowAction && <p className="text-neutral-500" role="status">{en.common.firstLoadSlow}</p>}

      {step.name === 'phone' ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void sendCode(phone);
          }}
        >
          <h1 className="text-2xl font-bold">{en.auth.phoneTitle}</h1>
          <p className="text-neutral-600">{en.auth.phoneHint}</p>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-neutral-600">{en.auth.phoneLabel}</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{config.defaultCountry.dialCode}</span>
              <input
                className={input}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={en.auth.phonePlaceholder}
                maxLength={20}
              />
            </div>
          </label>
          {error && <p className="text-red-700" role="alert">{error}</p>}
          <button className={button} type="submit" disabled={busy || phone.trim().length < 6}>
            {busy ? en.auth.sending : en.auth.sendCode}
          </button>
          {process.env.NODE_ENV === 'development' && !config.demo && (
            <p className="text-sm text-neutral-500">{en.auth.devCodeHint}</p>
          )}
          {config.demo && (
            <div className="mt-2 flex flex-col gap-2">
              <p className="text-sm text-neutral-600">{en.auth.demoAccounts}</p>
              {config.demo.accounts
                .filter((account) => account.role === 'ADMIN' || account.role === 'VENDOR')
                .map((account) => (
                  <button key={account.phone} type="button" className={secondaryButton} disabled={busy} onClick={() => void sendCode(account.phone)}>
                    {en.auth.demoRole[account.role]} · {account.phone}
                  </button>
                ))}
            </div>
          )}
        </form>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submitCode(step.phone);
          }}
        >
          <h1 className="text-2xl font-bold">{en.auth.codeTitle}</h1>
          <p className="text-neutral-600">{en.auth.codeSentTo(step.phone)}</p>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-neutral-600">{en.auth.codeLabel}</span>
            <input
              className={`${input} tracking-widest`}
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              autoFocus
            />
          </label>
          {error && <p className="text-red-700" role="alert">{error}</p>}
          <button className={button} type="submit" disabled={busy || code.length !== 6}>
            {busy ? en.auth.verifying : en.auth.verify}
          </button>
          <button type="button" className={secondaryButton} disabled={busy || resendIn > 0} onClick={() => void sendCode(step.phone)}>
            {resendIn > 0 ? en.auth.resendIn(resendIn) : en.auth.resend}
          </button>
          <button
            type="button"
            className={secondaryButton}
            disabled={busy}
            onClick={() => {
              setStep({ name: 'phone' });
              setError(null);
            }}
          >
            {en.auth.changeNumber}
          </button>
        </form>
      )}
    </div>
  );
}
