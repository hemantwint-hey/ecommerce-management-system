import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { CategoryDTO, ProductDTO } from '@/types/models';
import { getFieldErrors } from '@/utils/errors';

export interface ProductFormValues {
  productName: string;
  description: string;
  price: string;
  discount: string;
  quantity: string;
}

interface ProductFormProps {
  categories: CategoryDTO[];
  initial?: ProductDTO;
  onSubmit: (values: ProductFormValues, categoryId: number | null) => Promise<unknown>;
  onCancel: () => void;
}

export function ProductForm({ categories, initial, onSubmit, onCancel }: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>({
    productName: initial?.productName ?? '',
    description: initial?.description ?? '',
    price: initial?.price?.toString() ?? '',
    discount: initial?.discount?.toString() ?? '0',
    quantity: initial?.quantity?.toString() ?? '',
  });
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit(values, categoryId === '' ? null : categoryId);
    } catch (error) {
      setErrors(getFieldErrors(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
      {!initial && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
            required
            className="h-11 rounded-lg border border-border-strong bg-surface px-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>
      )}

      <Input
        label="Product name"
        value={values.productName}
        onChange={(e) => setValues((v) => ({ ...v, productName: e.target.value }))}
        error={errors.productName}
        required
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Description</label>
        <textarea
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          rows={3}
          required
          className="resize-none rounded-lg border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        {errors.description && <p className="text-xs font-medium text-error">{errors.description}</p>}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input
          label="Price (₹)"
          type="number"
          min="0"
          step="0.01"
          value={values.price}
          onChange={(e) => setValues((v) => ({ ...v, price: e.target.value }))}
          error={errors.price}
          required
        />
        <Input
          label="Discount (%)"
          type="number"
          min="0"
          max="100"
          value={values.discount}
          onChange={(e) => setValues((v) => ({ ...v, discount: e.target.value }))}
          error={errors.discount}
        />
        <Input
          label="Stock qty"
          type="number"
          min="0"
          value={values.quantity}
          onChange={(e) => setValues((v) => ({ ...v, quantity: e.target.value }))}
          error={errors.quantity}
          required
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={isSubmitting}>
          {initial ? 'Save changes' : 'Create product'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
