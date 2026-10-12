import { useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { Sheet } from '@/components/ui/Sheet';
import { SearchBar } from './SearchBar';

export const BRAND_NAME = 'Elyra';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
];

export function Navbar() {
  const { user, isAuthenticated, isAdmin, isSeller, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(accountRef, () => setAccountOpen(false));

  const handleLogout = async () => {
    setAccountOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="font-display text-xl tracking-tight text-ink">
          {BRAND_NAME}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'}`
              }
            >
              Admin
            </NavLink>
          )}
          {isSeller && (
            <NavLink
              to="/seller"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'}`
              }
            >
              Seller
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-muted"
          >
            <IconSearch />
          </button>

          <Link
            to="/cart"
            aria-label="Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-muted"
          >
            <IconBag />
            {itemCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          <div className="relative hidden sm:block" ref={accountRef}>
            <button
              onClick={() => setAccountOpen((v) => !v)}
              aria-label="Account"
              aria-expanded={accountOpen}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-muted"
            >
              <IconUser />
            </button>
            {accountOpen && (
              <div className="animate-slide-up absolute right-0 mt-2 w-56 rounded-xl border border-border bg-surface p-1.5 shadow-popover">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 text-sm">
                      <p className="font-medium text-ink">{user?.username}</p>
                    </div>
                    <div className="my-1 h-px bg-border" />
                    <MenuLink to="/account" label="My Account" onClick={() => setAccountOpen(false)} />
                    <MenuLink to="/account/orders" label="Orders" onClick={() => setAccountOpen(false)} />
                    <MenuLink to="/account/addresses" label="Addresses" onClick={() => setAccountOpen(false)} />
                    <button
                      onClick={handleLogout}
                      className="block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-error hover:bg-error-soft"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <MenuLink to="/login" label="Sign in" onClick={() => setAccountOpen(false)} />
                    <MenuLink to="/register" label="Create account" onClick={() => setAccountOpen(false)} />
                  </>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Menu"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-muted md:hidden"
          >
            <IconMenu />
          </button>
        </div>
      </div>

      <Sheet open={searchOpen} onClose={() => setSearchOpen(false)} position="center" title="Search">
        <div className="w-full p-5 sm:w-[28rem]">
          <SearchBar autoFocus onSubmit={() => setSearchOpen(false)} />
        </div>
      </Sheet>

      <Sheet open={mobileOpen} onClose={() => setMobileOpen(false)} position="right" title="Menu">
        <div className="flex w-72 flex-col gap-1 p-3">
          {NAV_LINKS.map((link) => (
            <MenuLink key={link.to} to={link.to} label={link.label} onClick={() => setMobileOpen(false)} large />
          ))}
          {isAdmin && <MenuLink to="/admin" label="Admin" onClick={() => setMobileOpen(false)} large />}
          {isSeller && <MenuLink to="/seller" label="Seller" onClick={() => setMobileOpen(false)} large />}
          <div className="my-2 h-px bg-border" />
          {isAuthenticated ? (
            <>
              <MenuLink to="/account" label="My Account" onClick={() => setMobileOpen(false)} large />
              <MenuLink to="/account/orders" label="Orders" onClick={() => setMobileOpen(false)} large />
              <MenuLink to="/account/addresses" label="Addresses" onClick={() => setMobileOpen(false)} large />
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="block w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-base text-error hover:bg-error-soft"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <MenuLink to="/login" label="Sign in" onClick={() => setMobileOpen(false)} large />
              <MenuLink to="/register" label="Create account" onClick={() => setMobileOpen(false)} large />
            </>
          )}
        </div>
      </Sheet>
    </header>
  );
}

function MenuLink({
  to,
  label,
  onClick,
  large,
}: {
  to: string;
  label: string;
  onClick: () => void;
  large?: boolean;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block rounded-lg text-ink hover:bg-surface-muted ${large ? 'px-3 py-2.5 text-base' : 'px-3 py-2 text-sm'}`}
    >
      {label}
    </Link>
  );
}

function IconSearch() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 8h12l-1 12H7L6 8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
