import { formatPrice } from '@/utils/format';

interface PriceDisplayProps {
  price: number;
  specialPrice?: number;
  discount?: number;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-2xl',
};

export function PriceDisplay({ price, specialPrice, discount, size = 'md' }: PriceDisplayProps) {
  const hasDiscount = !!discount && discount > 0 && specialPrice !== undefined && specialPrice < price;

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className={`font-semibold text-ink ${SIZE_CLASSES[size]}`}>
        {formatPrice(hasDiscount ? (specialPrice as number) : price)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-sm text-ink-faint line-through">{formatPrice(price)}</span>
          <span className="text-xs font-semibold text-success">{Math.round(discount as number)}% off</span>
        </>
      )}
    </div>
  );
}
