import { useState } from 'react';
import { AddressForm } from '@/components/address/AddressForm';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAddresses, useAddressMutations } from '@/hooks/useAddresses';
import type { AddressDTO } from '@/types/models';

export default function AccountAddresses() {
  const addressesQuery = useAddresses();
  const { create, update, remove } = useAddressMutations();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  if (addressesQuery.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    );
  }

  const addresses = addressesQuery.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      {addresses.length === 0 && !adding && (
        <EmptyState
          title="No addresses saved"
          description="Add an address to make checkout faster."
          action={
            <Button size="sm" onClick={() => setAdding(true)}>
              + Add address
            </Button>
          }
        />
      )}

      {addresses.map((address) => (
        <AddressRow
          key={address.addressId}
          address={address}
          isEditing={editingId === address.addressId}
          onEdit={() => setEditingId(address.addressId)}
          onCancelEdit={() => setEditingId(null)}
          onSave={async (payload) => {
            await update.mutateAsync({ addressId: address.addressId, payload });
            setEditingId(null);
          }}
          onDelete={() => remove.mutate(address.addressId)}
          isDeleting={remove.isPending}
        />
      ))}

      {addresses.length > 0 && !adding && (
        <Button variant="outline" onClick={() => setAdding(true)} className="self-start">
          + Add new address
        </Button>
      )}

      {adding && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-4 text-sm font-semibold text-ink">New address</h3>
          <AddressForm
            onSubmit={async (payload) => {
              await create.mutateAsync(payload);
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}
    </div>
  );
}

interface AddressRowProps {
  address: AddressDTO;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (payload: Omit<AddressDTO, 'addressId'>) => Promise<void>;
  onDelete: () => void;
  isDeleting: boolean;
}

function AddressRow({ address, isEditing, onEdit, onCancelEdit, onSave, onDelete, isDeleting }: AddressRowProps) {
  if (isEditing) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5">
        <AddressForm initial={address} submitLabel="Save changes" onSubmit={onSave} onCancel={onCancelEdit} />
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface p-5">
      <p className="text-sm text-ink-muted">
        {address.buildingName}, {address.street}, {address.city}, {address.state} {address.pincode},{' '}
        {address.country}
      </p>
      <div className="flex shrink-0 gap-3 text-sm font-semibold">
        <button onClick={onEdit} className="cursor-pointer text-accent hover:underline">
          Edit
        </button>
        <button onClick={onDelete} disabled={isDeleting} className="cursor-pointer text-error hover:underline disabled:opacity-50">
          Remove
        </button>
      </div>
    </div>
  );
}
