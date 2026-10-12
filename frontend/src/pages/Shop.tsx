import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductFilters, SortSelect, SORT_OPTIONS } from '@/components/product/ProductFilters';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Sheet } from '@/components/ui/Sheet';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';

const PAGE_SIZE = 12;

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categoryId = searchParams.get('category') ? Number(searchParams.get('category')) : undefined;
  const keyword = searchParams.get('q') ?? undefined;
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 0;
  const sortValue = searchParams.get('sort') ?? 'newest';
  const sortOption = SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0];

  const categoriesQuery = useCategories();
  const productsQuery = useProducts({
    categoryId,
    keyword,
    pageNumber: page,
    pageSize: PAGE_SIZE,
    sortBy: sortOption.sortBy,
    sortOrder: sortOption.sortOrder,
  });

  const activeCategory = useMemo(
    () => categoriesQuery.data?.content.find((c) => c.categoryId === categoryId),
    [categoriesQuery.data, categoryId],
  );

  const updateParams = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined) next.delete(key);
      else next.set(key, value);
    });
    if (!('page' in updates)) next.delete('page');
    setSearchParams(next);
  };

  const heading = keyword ? `Results for “${keyword}”` : activeCategory ? activeCategory.categoryName : 'Shop all';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink sm:text-4xl">{heading}</h1>
        <p className="mt-2 text-sm text-ink-muted">Discover pieces made to be worn, used, and kept.</p>
      </div>

      <div className="flex gap-10">
        <aside className="hidden w-56 shrink-0 lg:block">
          <ProductFilters
            categories={categoriesQuery.data?.content ?? []}
            activeCategoryId={categoryId}
            onCategoryChange={(id) => updateParams({ category: id?.toString() })}
          />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-between gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex h-10 cursor-pointer items-center gap-2 rounded-full border border-border-strong px-4 text-sm font-medium text-ink lg:hidden"
            >
              <IconFilter /> Filters
            </button>
            <p className="hidden text-sm text-ink-muted sm:block">
              {productsQuery.data ? `${productsQuery.data.totalElements} products` : ''}
            </p>
            <SortSelect value={sortValue} onChange={(value) => updateParams({ sort: value })} />
          </div>

          {productsQuery.isLoading && <ProductGridSkeleton count={PAGE_SIZE} />}

          {productsQuery.isError && (
            <ErrorState description="We couldn't load these products." onRetry={() => productsQuery.refetch()} />
          )}

          {productsQuery.data && productsQuery.data.content.length === 0 && (
            <EmptyState
              title="No products found"
              description="Try changing your search or filters."
              action={
                <button
                  onClick={() => setSearchParams({})}
                  className="text-sm font-semibold text-accent hover:underline"
                >
                  Clear all filters
                </button>
              }
            />
          )}

          {productsQuery.data && productsQuery.data.content.length > 0 && (
            <>
              <ProductGrid products={productsQuery.data.content} />
              <Pagination
                pageNumber={productsQuery.data.pageNumber}
                totalPages={productsQuery.data.totalPages}
                onPageChange={(nextPage) => updateParams({ page: nextPage.toString() })}
              />
            </>
          )}
        </div>
      </div>

      <Sheet open={filtersOpen} onClose={() => setFiltersOpen(false)} position="bottom" title="Filters">
        <div className="p-5">
          <ProductFilters
            categories={categoriesQuery.data?.content ?? []}
            activeCategoryId={categoryId}
            onCategoryChange={(id) => {
              updateParams({ category: id?.toString() });
              setFiltersOpen(false);
            }}
          />
        </div>
      </Sheet>
    </div>
  );
}

function IconFilter() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
