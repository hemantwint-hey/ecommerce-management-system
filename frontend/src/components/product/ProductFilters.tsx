import type { CategoryDTO } from '@/types/models';

export interface SortOption {
  value: string;
  label: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'Newest', sortBy: 'productId', sortOrder: 'desc' },
  { value: 'price-asc', label: 'Price: Low to High', sortBy: 'price', sortOrder: 'asc' },
  { value: 'price-desc', label: 'Price: High to Low', sortBy: 'price', sortOrder: 'desc' },
  { value: 'name-asc', label: 'Name: A to Z', sortBy: 'productName', sortOrder: 'asc' },
];

interface ProductFiltersProps {
  categories: CategoryDTO[];
  activeCategoryId?: number;
  onCategoryChange: (categoryId: number | undefined) => void;
}

export function ProductFilters({ categories, activeCategoryId, onCategoryChange }: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">Category</h3>
        <div className="flex flex-col gap-2.5">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-muted">
            <input
              type="radio"
              name="category"
              checked={activeCategoryId === undefined}
              onChange={() => onCategoryChange(undefined)}
              className="h-4 w-4 accent-accent"
            />
            All products
          </label>
          {categories.map((category) => (
            <label
              key={category.categoryId}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-muted"
            >
              <input
                type="radio"
                name="category"
                checked={activeCategoryId === category.categoryId}
                onChange={() => onCategoryChange(category.categoryId)}
                className="h-4 w-4 accent-accent"
              />
              {category.categoryName}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Sort products"
      className="h-10 cursor-pointer rounded-full border border-border-strong bg-surface px-4 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
