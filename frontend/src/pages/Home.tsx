import { Link } from 'react-router-dom';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { CategoryCard } from '@/components/product/CategoryCard';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';

const FEATURES = [
  {
    icon: <IconTruck />,
    title: 'Free shipping',
    body: 'On every order, no minimum.',
  },
  {
    icon: <IconReturn />,
    title: 'Easy returns',
    body: '30 days, no questions asked.',
  },
  {
    icon: <IconShield />,
    title: 'Secure checkout',
    body: 'Your details stay protected.',
  },
];

export default function Home() {
  const categoriesQuery = useCategories(8);
  const featuredQuery = useProducts({ pageNumber: 0, pageSize: 8, sortBy: 'productId', sortOrder: 'desc' });

  return (
    <div className="flex flex-col">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:items-center md:py-20 lg:px-8">
        <div className="flex animate-slide-up flex-col items-start gap-6">
          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
            New season edit
          </span>
          <h1 className="font-display text-5xl leading-[1.05] text-ink text-balance sm:text-6xl">
            Elevate your everyday
          </h1>
          <p className="max-w-md text-base text-ink-muted">
            A considered edit of everyday essentials, chosen for quality and built to last well beyond the season.
          </p>
          <Link
            to="/shop"
            className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-accent px-7 text-base font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Shop now <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="relative aspect-4/5 overflow-hidden rounded-3xl bg-linear-to-br from-[#eae5da] to-[#cfc6b5] md:aspect-square">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="h-2/3 w-2/3 text-ink/15" fill="none" aria-hidden="true">
              <rect x="30" y="50" width="140" height="120" rx="12" stroke="currentColor" strokeWidth="3" />
              <path d="M70 50V38a30 30 0 0160 0v12" stroke="currentColor" strokeWidth="3" />
            </svg>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                {feature.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{feature.title}</p>
                <p className="text-sm text-ink-muted">{feature.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {categoriesQuery.data && categoriesQuery.data.content.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-3xl text-ink">Shop by category</h2>
          </div>
          <div className="scrollbar-none flex gap-6 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:gap-8 lg:grid-cols-6">
            {categoriesQuery.data.content.map((category, index) => (
              <CategoryCard key={category.categoryId} category={category} index={index} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl text-ink">Just landed</h2>
          <Link to="/shop" className="text-sm font-semibold text-accent hover:underline">
            View all →
          </Link>
        </div>

        {featuredQuery.isLoading && <ProductGridSkeleton />}
        {featuredQuery.isError && (
          <ErrorState description="We couldn't load featured products." onRetry={() => featuredQuery.refetch()} />
        )}
        {featuredQuery.data && <ProductGrid products={featuredQuery.data.content} />}
      </section>
    </div>
  );
}

function IconTruck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 7h11v9H2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13 10h4l3 3v3h-7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="6" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.5" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function IconReturn() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12a8 8 0 1 0 3-6.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 3v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
