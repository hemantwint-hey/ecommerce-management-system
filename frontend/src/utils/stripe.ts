import { loadStripe } from '@stripe/stripe-js';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

/** Card payments are offered only when a publishable key is configured. */
export const isStripeEnabled = !!publishableKey;

// Created once at module level so Stripe.js is loaded a single time.
export const stripePromise = publishableKey ? loadStripe(publishableKey) : null;
