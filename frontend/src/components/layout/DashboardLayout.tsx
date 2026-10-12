import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { BRAND_NAME } from './Navbar';

export interface DashboardLink {
  to: string;
  label: string;
  end?: boolean;
}

/** Sidebar shell shared by the admin and seller panels. */
export function DashboardLayout({ badge, links }: { badge: string; links: DashboardLink[] }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-surface md:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <span className="font-display text-lg text-ink">{BRAND_NAME}</span>
          <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
            {badge}
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-ink text-white' : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <button
            onClick={() => navigate('/')}
            className="mb-1 block w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink-muted hover:bg-surface-muted hover:text-ink"
          >
            ← Back to store
          </button>
          <button
            onClick={handleLogout}
            className="block w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm font-medium text-error hover:bg-error-soft"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col md:ml-60">
        <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 md:hidden">
          <span className="font-display text-lg text-ink">{BRAND_NAME} {badge}</span>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-surface px-3 py-2 md:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                  isActive ? 'bg-ink text-white' : 'text-ink-muted'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto flex max-w-6xl items-center justify-end pb-4 text-sm text-ink-muted">
            Signed in as <span className="ml-1 font-medium text-ink">{user?.username}</span>
          </div>
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
