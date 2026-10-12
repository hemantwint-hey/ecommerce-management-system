import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AddressForm } from '@/components/address/AddressForm';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAddresses, useAddressMutations } from '@/hooks/useAddresses';
import { useCart } from '@/hooks/useCart';
import { usePlaceOrder } from '@/hooks/useOrders';
import { PAYMENT_METHODS, type PaymentMethod } from '@/types/models';
import { formatPrice } from '@/utils/format';
import { productImageUrl } from '@/utils/images';
import { isStripeEnabled } from '@/utils/stripe';
import { StripeCardPayment } from '@/components/checkout/StripeCardPayment';

const STEPS = ['Address', 'Payment', 'Review'] as const;

const PAYMENT_LABELS: Record<PaymentMethod, { label: string; note?: string }> = {
  CASH_ON_DELIVERY: { label: 'Cash on Delivery', note: 'Pay when your order arrives.' },
  STRIPE: {
    label: 'Credit / Debit card',
    note: isStripeEnabled
      ? 'Secure payment by Stripe (test mode).'
      : 'Unavailable: card payments are not configured (set VITE_STRIPE_PUBLISHABLE_KEY).',
  },
};

export default function Checkout() {
  const { cart, isLoading: cartLoading } = useCart();
  const addressesQuery = useAddresses();
  const { create: createAddress } = useAddressMutations();
  const placeOrder = usePlaceOrder();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [addingNew, setAddingNew] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_ON_DELIVERY');
  const [paidIntentId, setPaidIntentId] = useState<string | null>(null);

  const addresses = addressesQuery.data ?? [];
  const effectiveAddressId = selectedAddressId ?? addresses[0]?.addressId;

  if (!cartLoading && cart.products.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const subtotal = cart.products.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = subtotal - cart.totalPrice;

  const handlePlaceOrder = async () => {
    if (!effectiveAddressId) return;
    const order = await placeOrder.mutateAsync({
      paymentMethod: 'CASH_ON_DELIVERY',
      payload: { addressId: effectiveAddressId },
    });
    navigate(`/order-confirmation/${order.orderId}`);
  };

  // Stripe has already taken the money here; the backend re-checks the PaymentIntent before saving the order.
  const handleStripePaid = async (paymentIntentId: string) => {
    if (!effectiveAddressId) return;
    setPaidIntentId(paymentIntentId);
    try {
      const order = await placeOrder.mutateAsync({
        paymentMethod: 'STRIPE',
        payload: { addressId: effectiveAddressId, pgPaymentId: paymentIntentId },
      });
      navigate(`/order-confirmation/${order.orderId}`);
    } catch {
      // usePlaceOrder shows the error toast; the retry button below re-submits the same paid intent.
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-3xl text-ink">Checkout</h1>

      <ol className="mb-10 flex items-center gap-3 text-sm">
        {STEPS.map((label, index) => (
          <li key={label} className="flex items-center gap-3">
            <button
              onClick={() => index < step && setStep(index)}
              disabled={index > step}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                index === step
                  ? 'bg-ink text-white'
                  : index < step
                    ? 'cursor-pointer bg-success text-white'
                    : 'bg-surface-muted text-ink-faint'
              }`}
            >
              {index < step ? '✓' : index + 1}
            </button>
            <span className={index === step ? 'font-medium text-ink' : 'text-ink-muted'}>{label}</span>
            {index < STEPS.length - 1 && <span className="mx-1 h-px w-8 bg-border" />}
          </li>
        ))}
      </ol>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === 0 && (
            <div className="animate-fade-in flex flex-col gap-4">
              {addressesQuery.isLoading && <Skeleton className="h-32 w-full rounded-xl" />}

              {!addressesQuery.isLoading && addresses.length > 0 && !addingNew && (
                <div className="flex flex-col gap-3">
                  {addresses.map((address) => (
                    <label
                      key={address.addressId}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                        effectiveAddressId === address.addressId ? 'border-ink bg-surface-muted' : 'border-border bg-surface'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        className="mt-1 h-4 w-4 accent-accent"
                        checked={effectiveAddressId === address.addressId}
                        onChange={() => setSelectedAddressId(address.addressId)}
                      />
                      <span className="text-sm text-ink">
                        {address.buildingName}, {address.street}, {address.city}, {address.state} {address.pincode},{' '}
                        {address.country}
                      </span>
                    </label>
                  ))}
                  <button
                    onClick={() => setAddingNew(true)}
                    className="self-start text-sm font-semibold text-accent hover:underline"
                  >
                    + Add a new address
                  </button>
                </div>
              )}

              {!addressesQuery.isLoading && (addresses.length === 0 || addingNew) && (
                <div className="rounded-xl border border-border bg-surface p-5">
                  <AddressForm
                    submitLabel="Save & continue"
                    onSubmit={async (payload) => {
                      const created = await createAddress.mutateAsync(payload);
                      setSelectedAddressId(created.addressId);
                      setAddingNew(false);
                      setStep(1);
                    }}
                    onCancel={addresses.length > 0 ? () => setAddingNew(false) : undefined}
                  />
                </div>
              )}

              {!addingNew && addresses.length > 0 && (
                <button
                  onClick={() => setStep(1)}
                  disabled={!effectiveAddressId}
                  className="mt-2 h-12 w-full cursor-pointer rounded-full bg-ink text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-ink-faint sm:w-auto sm:px-8"
                >
                  Continue to payment
                </button>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-in flex flex-col gap-3">
              {PAYMENT_METHODS.map((method) => {
                const unavailable = method === 'STRIPE' && !isStripeEnabled;
                return (
                  <label
                    key={method}
                    className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                      unavailable ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    } ${paymentMethod === method ? 'border-ink bg-surface-muted' : 'border-border bg-surface'}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="mt-1 h-4 w-4 accent-accent"
                      checked={paymentMethod === method}
                      disabled={unavailable}
                      onChange={() => setPaymentMethod(method)}
                    />
                    <span>
                      <span className="block text-sm font-medium text-ink">{PAYMENT_LABELS[method].label}</span>
                      {PAYMENT_LABELS[method].note && (
                        <span className="mt-0.5 block text-xs text-ink-muted">{PAYMENT_LABELS[method].note}</span>
                      )}
                    </span>
                  </label>
                );
              })}
              <div className="mt-2 flex gap-3">
                <button
                  onClick={() => setStep(0)}
                  className="h-12 cursor-pointer rounded-full border border-border-strong px-6 text-sm font-semibold text-ink"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="h-12 flex-1 cursor-pointer rounded-full bg-ink text-sm font-semibold text-white sm:flex-none sm:px-8"
                >
                  Review order
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in flex flex-col gap-6">
              <div>
                <h2 className="mb-3 text-sm font-semibold text-ink">Items</h2>
                <div className="flex flex-col gap-3">
                  {cart.products.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                        {productImageUrl(item.image) && (
                          <img src={productImageUrl(item.image) as string} alt={item.productName} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-ink">{item.productName}</p>
                        <p className="text-xs text-ink-muted">Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-ink">{formatPrice(item.specialPrice * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {paymentMethod === 'STRIPE' && paidIntentId && (
                <div className="flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning-soft p-4 text-sm text-ink">
                  <p>
                    Your card payment went through (ref. <span className="font-mono">{paidIntentId}</span>), but the
                    order has not been saved yet.
                  </p>
                  <button
                    onClick={() => handleStripePaid(paidIntentId)}
                    disabled={placeOrder.isPending}
                    className="h-11 w-fit cursor-pointer rounded-full bg-ink px-6 text-sm font-semibold text-white disabled:bg-ink-faint"
                  >
                    {placeOrder.isPending ? 'Saving order…' : 'Retry saving my order'}
                  </button>
                </div>
              )}

              {paymentMethod === 'STRIPE' && !paidIntentId && (
                <StripeCardPayment cartTotal={cart.totalPrice} onBack={() => setStep(1)} onPaid={handleStripePaid} />
              )}

              {paymentMethod === 'CASH_ON_DELIVERY' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="h-12 cursor-pointer rounded-full border border-border-strong px-6 text-sm font-semibold text-ink"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placeOrder.isPending}
                    className="h-12 flex-1 cursor-pointer rounded-full bg-accent text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-ink-faint sm:flex-none sm:px-8"
                  >
                    {placeOrder.isPending ? 'Placing order…' : 'Place order →'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-fit rounded-2xl border border-border bg-surface p-6 shadow-card">
          <h2 className="mb-4 font-display text-lg text-ink">Order summary</h2>
          <dl className="flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Subtotal</dt>
              <dd className="text-ink">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Shipping</dt>
              <dd className="text-success">Free</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-muted">Discount</dt>
                <dd className="text-success">−{formatPrice(discount)}</dd>
              </div>
            )}
            <div className="my-1 h-px bg-border" />
            <div className="flex justify-between text-base font-semibold">
              <dt className="text-ink">Total</dt>
              <dd className="text-ink">{formatPrice(cart.totalPrice)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
