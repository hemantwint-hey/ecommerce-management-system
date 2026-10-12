import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { AddressDTO } from '@/types/models';
import type { AddressPayload } from '@/api/addressApi';
import { getFieldErrors } from '@/utils/errors';

interface AddressFormProps {
  initial?: AddressDTO;
  onSubmit: (payload: AddressPayload) => Promise<unknown>;
  onCancel?: () => void;
  submitLabel?: string;
}

const EMPTY: AddressPayload = {
  street: '',
  buildingName: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
};

export function AddressForm({ initial, onSubmit, onCancel, submitLabel = 'Save address' }: AddressFormProps) {
  const [form, setForm] = useState<AddressPayload>(initial ?? EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof AddressPayload) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit(form);
    } catch (error) {
      setErrors(getFieldErrors(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Building / house name" value={form.buildingName} onChange={handleChange('buildingName')} error={errors.buildingName} required />
        <Input label="Street" value={form.street} onChange={handleChange('street')} error={errors.street} required />
        <Input label="City" value={form.city} onChange={handleChange('city')} error={errors.city} required />
        <Input label="State" value={form.state} onChange={handleChange('state')} error={errors.state} required />
        <Input label="Country" value={form.country} onChange={handleChange('country')} error={errors.country} required />
        <Input label="Pincode" value={form.pincode} onChange={handleChange('pincode')} error={errors.pincode} required />
      </div>
      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
