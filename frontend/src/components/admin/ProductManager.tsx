import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { Pagination } from '@/components/ui/Pagination';
import { StockBadge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/ui/EmptyState';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { ProductForm, type ProductFormValues } from '@/components/admin/ProductForm';
import { useCategories } from '@/hooks/useCategories';
import type { ShopFilters } from '@/hooks/useProducts';
import type { useProductMutations } from '@/hooks/useAdmin';
import type { ProductDTO, ProductResponse } from '@/types/models';
import type { UseQueryResult } from '@tanstack/react-query';
import { formatPrice } from '@/utils/format';
import { productImageUrl } from '@/utils/images';

const PAGE_SIZE = 10;

interface ProductManagerProps {
  title: string;
  subtitle: string;
  /** Hook that lists the products this panel manages (all products for admins, own products for sellers). */
  useProductList: (filters: ShopFilters) => UseQueryResult<ProductResponse>;
  useMutations: () => ReturnType<typeof useProductMutations>;
  showCategoryFilter?: boolean;
  emptyMessage?: string;
}

/** Product table + create/edit sheet shared by the admin and seller panels. */
export function ProductManager({
  title,
  subtitle,
  useProductList,
  useMutations,
  showCategoryFilter = true,
  emptyMessage = 'No products in this category yet.',
}: ProductManagerProps) {
  const [page, setPage] = useState(0);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [sheetMode, setSheetMode] = useState<'create' | 'edit' | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoriesQuery = useCategories();
  const productsQuery = useProductList({ categoryId, pageNumber: page, pageSize: PAGE_SIZE, sortBy: 'productId', sortOrder: 'desc' });
  const { create, update, remove, uploadImage } = useMutations();

  const toPayload = (values: ProductFormValues) => ({
    productName: values.productName,
    description: values.description,
    price: Number(values.price),
    discount: Number(values.discount || 0),
    quantity: Number(values.quantity),
  });

  const handleCreate = async (values: ProductFormValues, categoryId: number | null) => {
    if (!categoryId) return;
    await create.mutateAsync({ categoryId, product: toPayload(values) });
    setSheetMode(null);
  };

  const handleUpdate = async (values: ProductFormValues) => {
    if (!editingProduct) return;
    await update.mutateAsync({ productId: editingProduct.productId, product: toPayload(values) });
    setSheetMode(null);
    setEditingProduct(null);
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingId !== null) {
      uploadImage.mutate({ productId: uploadingId, file });
    }
    e.target.value = '';
    setUploadingId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">{title}</h1>
          <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
        </div>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setSheetMode('create');
          }}
        >
          + Add product
        </Button>
      </div>

      {showCategoryFilter && (
        <select
          value={categoryId ?? ''}
          onChange={(e) => {
            setCategoryId(e.target.value ? Number(e.target.value) : undefined);
            setPage(0);
          }}
          className="h-10 w-fit rounded-full border border-border-strong bg-surface px-4 text-sm text-ink"
        >
          <option value="">All categories</option>
          {categoriesQuery.data?.content.map((category) => (
            <option key={category.categoryId} value={category.categoryId}>
              {category.categoryName}
            </option>
          ))}
        </select>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileSelected} />

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-ink-faint">
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Stock</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {productsQuery.isLoading &&
              Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} columns={4} />)}

            {productsQuery.data?.content.map((product) => {
              const imageUrl = productImageUrl(product.image);
              return (
                <tr key={product.productId} className="border-t border-border">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                        {imageUrl && <img src={imageUrl} alt={product.productName} className="h-full w-full object-cover" />}
                      </div>
                      <span className="line-clamp-1 font-medium text-ink">{product.productName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink">{formatPrice(product.specialPrice)}</td>
                  <td className="px-5 py-3">
                    <StockBadge quantity={product.quantity} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-3 text-sm font-semibold">
                      <button
                        onClick={() => {
                          setUploadingId(product.productId);
                          fileInputRef.current?.click();
                        }}
                        className="cursor-pointer text-ink-muted hover:text-ink hover:underline"
                      >
                        Image
                      </button>
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setSheetMode('edit');
                        }}
                        className="cursor-pointer text-accent hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove.mutate(product.productId)}
                        disabled={remove.isPending}
                        className="cursor-pointer text-error hover:underline disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {productsQuery.isError && (
          <div className="p-6">
            <ErrorState description="Couldn't load products." onRetry={() => productsQuery.refetch()} />
          </div>
        )}

        {productsQuery.data && productsQuery.data.content.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-ink-muted">{emptyMessage}</p>
        )}
      </div>

      {productsQuery.data && (
        <Pagination pageNumber={productsQuery.data.pageNumber} totalPages={productsQuery.data.totalPages} onPageChange={setPage} />
      )}

      <Sheet
        open={sheetMode !== null}
        onClose={() => {
          setSheetMode(null);
          setEditingProduct(null);
        }}
        position="right"
        title={sheetMode === 'edit' ? 'Edit product' : 'Add product'}
      >
        <div className="w-full sm:w-[26rem]">
          <ProductForm
            categories={categoriesQuery.data?.content ?? []}
            initial={editingProduct ?? undefined}
            onSubmit={sheetMode === 'edit' ? (values) => handleUpdate(values) : handleCreate}
            onCancel={() => {
              setSheetMode(null);
              setEditingProduct(null);
            }}
          />
        </div>
      </Sheet>
    </div>
  );
}
