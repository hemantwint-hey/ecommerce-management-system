interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled?: boolean;
  max?: number;
  size?: 'sm' | 'md';
}

export function QuantitySelector({ quantity, onIncrease, onDecrease, disabled, max, size = 'md' }: QuantitySelectorProps) {
  const dimension = size === 'sm' ? 'h-8 w-8 text-sm' : 'h-10 w-10 text-base';
  const atMax = max !== undefined && quantity >= max;

  return (
    <div className="inline-flex items-center rounded-full border border-border-strong">
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled || quantity <= 1}
        aria-label="Decrease quantity"
        className={`flex ${dimension} items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:text-ink-faint disabled:hover:bg-transparent`}
      >
        −
      </button>
      <span className="min-w-8 text-center text-sm font-medium tabular-nums text-ink" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled || atMax}
        aria-label="Increase quantity"
        className={`flex ${dimension} items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:text-ink-faint disabled:hover:bg-transparent`}
      >
        +
      </button>
    </div>
  );
}
