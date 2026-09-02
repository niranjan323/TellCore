import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BadgeCheck, Crown, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Toast } from '../components/ui/Toast';
import {
  createCheckoutSession,
  fetchBillingPlans,
  fetchBillingStatus,
} from '../api/stories.api';

const PERKS = [
  'Read every community story in full',
  'Listen to voice stories',
  'Family vault & invite links',
  'Unlimited stories',
  'Multilingual AI on every story',
];

export function UpgradePage() {
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const plans = useQuery({ queryKey: ['billing-plans'], queryFn: fetchBillingPlans });
  const status = useQuery({ queryKey: ['billing-status'], queryFn: fetchBillingStatus });

  async function handleCheckout(planKey: string) {
    setRedirecting(planKey);
    try {
      const session = await createCheckoutSession(planKey);
      window.location.href = session.url;
    } catch {
      setRedirecting(null);
      setToast('Checkout is unavailable right now — try again in a moment.');
    }
  }

  const isPaid = status.data?.userType === 'paid';

  return (
    <div className="pt-safe relative min-h-dvh overflow-hidden bg-surface px-4 py-8 md:px-10">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 mesh-warm opacity-80" />
        <div className="absolute inset-0 bg-paper-grain opacity-70" />
      </div>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-sm font-medium text-text-secondary backdrop-blur hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back
      </button>

      <div className="mx-auto mt-8 max-w-2xl text-center">
        <p className="font-handwritten text-xl text-primary-dark md:text-2xl">
          Every story, whole.
        </p>
        <h1 className="mt-1 font-display text-[32px] font-semibold leading-tight tracking-tight text-text-primary md:text-[44px]">
          TheUntold Premium
        </h1>
        <ul className="mx-auto mt-6 flex max-w-sm flex-col gap-2 text-left">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-2 text-sm text-text-secondary">
              <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              {perk}
            </li>
          ))}
        </ul>
      </div>

      {isPaid ? (
        <div className="editorial-card mx-auto mt-10 max-w-md rounded-lg border p-8 text-center">
          <Crown className="mx-auto h-8 w-8 text-accent" aria-hidden />
          <p className="mt-3 font-display text-xl font-semibold text-text-primary">
            You&apos;re a member
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            {status.data?.planKey ?? 'premium'} ·{' '}
            {status.data?.currentPeriodEnd
              ? `renews ${new Date(status.data.currentPeriodEnd).toLocaleDateString()}`
              : 'active'}
          </p>
        </div>
      ) : plans.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="mx-auto mt-10 grid max-w-2xl gap-5 md:grid-cols-2">
          {(plans.data ?? []).map((plan) => {
            const yearly = plan.interval === 'year';
            return (
              <div
                key={plan.key}
                className={`editorial-card relative rounded-lg border p-6 ${yearly ? 'md:-translate-y-2' : ''}`}
              >
                {yearly && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-dark">
                    Best value
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" aria-hidden />
                  <p className="font-display text-lg font-semibold text-text-primary">{plan.name}</p>
                </div>
                <p className="mt-3 font-display text-3xl font-semibold text-text-primary">
                  {plan.display}
                </p>
                <p className="mt-2 min-h-10 text-sm text-text-secondary">{plan.description}</p>
                <div className="mt-5">
                  <Button
                    label={redirecting === plan.key ? 'Opening checkout…' : `Choose ${plan.interval === 'year' ? 'yearly' : 'monthly'}`}
                    variant={yearly ? 'gold' : 'primary'}
                    loading={redirecting === plan.key}
                    onClick={() => handleCheckout(plan.key)}
                    fullWidth
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mx-auto mt-8 max-w-md text-center text-xs text-text-hint">
        Payments are processed by Stripe. Cancel anytime.
      </p>

      {toast && <Toast message={toast} kind="error" onDismiss={() => setToast(null)} />}
    </div>
  );
}
