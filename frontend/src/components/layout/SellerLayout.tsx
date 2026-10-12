import { DashboardLayout } from './DashboardLayout';

const LINKS = [
  { to: '/seller', label: 'Dashboard', end: true },
  { to: '/seller/products', label: 'My products' },
  { to: '/seller/orders', label: 'Orders' },
];

export function SellerLayout() {
  return <DashboardLayout badge="Seller" links={LINKS} />;
}
