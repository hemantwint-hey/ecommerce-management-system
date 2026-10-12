import { Link } from 'react-router-dom';
import { BRAND_NAME } from './Navbar';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="flex flex-col gap-3">
          <span className="font-display text-xl text-ink">{BRAND_NAME}</span>
          <p className="max-w-xs text-sm text-ink-muted">
            A considered edit of everyday essentials, made to last.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-ink">Shop</h4>
          <Link to="/shop" className="text-sm text-ink-muted hover:text-ink">
            All products
          </Link>
          <Link to="/cart" className="text-sm text-ink-muted hover:text-ink">
            Your cart
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-ink">Account</h4>
          <Link to="/account/orders" className="text-sm text-ink-muted hover:text-ink">
            Track an order
          </Link>
          <Link to="/login" className="text-sm text-ink-muted hover:text-ink">
            Sign in
          </Link>
        </div>
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-ink-faint sm:px-6 lg:px-8">
        © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
