import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCategories, useCategoryMutations } from '@/hooks/useCategories';
import { getFieldErrors } from '@/utils/errors';

export default function AdminCategories() {
  const categoriesQuery = useCategories();
  const { create, update, remove } = useCategoryMutations();
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(undefined);
    try {
      await create.mutateAsync(newName);
      setNewName('');
    } catch (err) {
      setError(getFieldErrors(err).categoryName);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ink">Categories</h1>
        <p className="mt-1 text-sm text-ink-muted">Organize your catalog.</p>
      </div>

      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-5">
        <div className="min-w-48 flex-1">
          <Input
            label="New category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            error={error}
            required
          />
        </div>
        <Button type="submit" isLoading={create.isPending}>
          Add category
        </Button>
      </form>

      {categoriesQuery.isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      )}

      {categoriesQuery.isError && <ErrorState description="Couldn't load categories." onRetry={() => categoriesQuery.refetch()} />}

      {categoriesQuery.data && categoriesQuery.data.content.length === 0 && (
        <EmptyState title="No categories yet" description="Create your first category above." />
      )}

      <div className="flex flex-col gap-2">
        {categoriesQuery.data?.content.map((category) => (
          <div
            key={category.categoryId}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4"
          >
            {editingId === category.categoryId ? (
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="h-9 flex-1 rounded-lg border border-border-strong px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                autoFocus
              />
            ) : (
              <span className="text-sm font-medium text-ink">{category.categoryName}</span>
            )}
            <div className="flex shrink-0 gap-3 text-sm font-semibold">
              {editingId === category.categoryId ? (
                <>
                  <button
                    onClick={() => {
                      update.mutate({ categoryId: category.categoryId, categoryName: editValue });
                      setEditingId(null);
                    }}
                    className="cursor-pointer text-success hover:underline"
                  >
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="cursor-pointer text-ink-muted hover:underline">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditingId(category.categoryId);
                      setEditValue(category.categoryName);
                    }}
                    className="cursor-pointer text-accent hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove.mutate(category.categoryId)}
                    disabled={remove.isPending}
                    className="cursor-pointer text-error hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
