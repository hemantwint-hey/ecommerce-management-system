import { DashboardLayout } from './DashboardLayout';

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/users', label: 'Users' },
];

export function AdminLayout() {
  return <DashboardLayout badge="Admin" links={LINKS} />;
}
