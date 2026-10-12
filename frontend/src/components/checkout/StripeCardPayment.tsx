import { useState, type FormEvent } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/api/orderApi';
import { ErrorState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { getErrorMessage } from '@/utils/errors';
import { formatPrice } from '@/utils/format';
import { stripePromise } from '@/utils/stripe';

interface StripeCardPaymentProps {
  /** Only used to start a fresh PaymentIntent if the cart total changes. */
  cartTotal: number;
  onBack: () => void;
  /** Called once Stripe reports the payment as succeeded. */
  onPaid: (paymentIntentId: string) => Promise<void>;
}

export function StripeCardPayment({ cartTotal, onBack, onPaid }: StripeCardPaymentProps) {
  const intentQuery = useQuery({
    queryKey: ['stripe-intent', cartTotal],
    queryFn: orderApi.createStripePayment,
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
  });

  if (intentQuery.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;
  if (intentQuery.isError || !intentQuery.data) {
    return (
      <ErrorState
        description={getErrorMessage(intentQuery.error, "We couldn't start the card payment.")}
        onRetry={() => intentQuery.refetch()}
      />
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret: intentQuery.data.clientSecret, appearance: { theme: 'stripe' } }}
    >
      <CardForm amount={intentQuery.data.amount / 100} onBack={onBack} onPaid={onPaid} />
    </Elements>
  );
}

function CardForm({ amount, onBack, onPaid }: { amount: number; onBack: () => void; onPaid: (id: string) => Promise<void> }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setError(null);
    setIsPaying(true);
    // The PaymentIntent only allows methods without redirects, so this resolves on this page.
    const result = await stripe.confirmPayment({ elements, redirect: 'if_required' });
    if (result.error) {
      setError(result.error.message ?? 'Payment failed. Please try another card.');
      setIsPaying(false);
      return;
    }
    if (result.paymentIntent.status !== 'succeeded') {
      setError(`Payment is ${result.paymentIntent.status}. Please try again.`);
      setIsPaying(false);
      return;
    }
    await onPaid(result.paymentIntent.id);
    setIsPaying(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-surface p-4">
        <PaymentElement />
      </div>
      <p className="text-xs text-ink-faint">
        Test mode: use card 4242 4242 4242 4242, any future expiry date and any CVC.
      </p>
      {error && <p className="text-sm font-medium text-error">{error}</p>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isPaying}
          className="h-12 cursor-pointer rounded-full border border-border-strong px-6 text-sm font-semibold text-ink disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || isPaying}
          className="h-12 flex-1 cursor-pointer rounded-full bg-accent text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-ink-faint sm:flex-none sm:px-8"
        >
          {isPaying ? 'Processing…' : `Pay ${formatPrice(amount)} & place order`}
        </button>
      </div>
    </form>
  );
}
