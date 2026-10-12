import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-6xl text-ink-faint">404</p>
      <h1 className="font-display text-2xl text-ink">Page not found</h1>
      <p className="text-sm text-ink-muted">The page you're looking for doesn't exist or has moved.</p>
      <Link
        to="/"
        className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-white hover:bg-accent-hover"
      >
        Back to home
      </Link>
    </div>
  );
}
