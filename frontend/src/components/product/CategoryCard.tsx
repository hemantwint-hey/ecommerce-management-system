import { Link } from 'react-router-dom';
import type { CategoryDTO } from '@/types/models';

const GRADIENTS = [
  'from-[#e9e3d6] to-[#d9d0bd]',
  'from-[#e3e6df] to-[#c9d2c1]',
  'from-[#e7dfe0] to-[#d3c2c4]',
  'from-[#dee4ea] to-[#c2ccd8]',
  'from-[#ece3d9] to-[#d6c6ae]',
];

export function CategoryCard({ category, index }: { category: CategoryDTO; index: number }) {
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <Link
      to={`/shop?category=${category.categoryId}`}
      className="group flex shrink-0 flex-col items-center gap-3 sm:w-auto"
    >
      <div
        className={`flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br sm:h-32 sm:w-32 ${gradient} shadow-card transition-transform duration-300 group-hover:scale-[1.04]`}
      >
        <span className="font-display text-2xl text-ink/70 sm:text-3xl">
          {category.categoryName.charAt(0).toUpperCase()}
        </span>
      </div>
      <span className="text-sm font-medium text-ink">{category.categoryName}</span>
    </Link>
  );
}
