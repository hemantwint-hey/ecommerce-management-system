type BadgeTone = 'neutral' | 'success' | 'warning' | 'error' | 'accent';

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted text-ink-muted',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  error: 'bg-error-soft text-error',
  accent: 'bg-accent-soft text-accent',
};

const STATUS_TONE: Record<string, BadgeTone> = {
  'order accepted !': 'accent',
  processing: 'accent',
  shipped: 'warning',
  'out for delivery': 'warning',
  delivered: 'success',
  cancelled: 'error',
};

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONE[status.toLowerCase()] ?? 'neutral';
  return <Badge tone={tone}>{status}</Badge>;
}

export function StockBadge({ quantity }: { quantity: number }) {
  if (quantity <= 0) return <Badge tone="error">Out of stock</Badge>;
  if (quantity <= 5) return <Badge tone="warning">Only {quantity} left</Badge>;
  return <Badge tone="success">In stock</Badge>;
}
