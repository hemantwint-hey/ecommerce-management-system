import { NavLink, Outlet } from 'react-router-dom';

const LINKS = [
  { to: '/account', label: 'Overview', end: true },
  { to: '/account/orders', label: 'My Orders' },
  { to: '/account/addresses', label: 'Addresses' },
];

export default function AccountLayout() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-3xl text-ink">My Account</h1>
      <div className="grid gap-10 md:grid-cols-[200px_1fr]">
        <nav className="scrollbar-none flex gap-1 overflow-x-auto md:flex-col">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `shrink-0 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-ink text-white' : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
