import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import type { SignupError } from '@/store/authSlice';

export default function Register() {
  const { signup, isSigningUp, signupError } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    try {
      await signup(form);
      showToast('Account created. Please sign in.', 'success');
      navigate('/login');
    } catch (error) {
      setFieldErrors((error as SignupError).fieldErrors ?? {});
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl text-ink">Create your account</h1>
        <p className="mt-2 text-sm text-ink-muted">Join to start shopping.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex animate-slide-up flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <Input
          label="Username"
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          error={fieldErrors.username}
          required
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          error={fieldErrors.email}
          required
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          error={fieldErrors.password}
          hint="At least 6 characters"
          required
        />
        {signupError && Object.keys(fieldErrors).length === 0 && (
          <p role="alert" className="rounded-lg bg-error-soft px-3 py-2 text-sm font-medium text-error">
            {signupError}
          </p>
        )}
        <Button type="submit" size="lg" isLoading={isSigningUp} fullWidth>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
