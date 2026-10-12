import { ErrorState } from '@/components/ui/EmptyState';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { useAdminUsers, useUpdateUserRoles } from '@/hooks/useAdmin';
import { APP_ROLES } from '@/types/models';
import { useAuth } from '@/hooks/useAuth';

export default function AdminUsers() {
  const usersQuery = useAdminUsers();
  const updateRoles = useUpdateUserRoles();
  const { user: currentUser } = useAuth();

  const toggleRole = (userId: number, roles: string[], role: string) => {
    const nextRoles = roles.includes(role) ? roles.filter((r) => r !== role) : [...roles, role];
    updateRoles.mutate({ userId, roles: nextRoles.length > 0 ? nextRoles : [APP_ROLES.USER] });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Users</h1>
        <p className="mt-1 text-sm text-ink-muted">Manage access across your store.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-ink-faint">
              <th className="px-5 py-3 font-medium">Username</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Roles</th>
              <th className="px-5 py-3 font-medium">Seller access</th>
              <th className="px-5 py-3 font-medium">Admin access</th>
            </tr>
          </thead>
          <tbody>
            {usersQuery.isLoading && Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={5} />)}
            {usersQuery.data?.map((user) => {
              const isAdmin = user.roles.includes(APP_ROLES.ADMIN);
              const isSeller = user.roles.includes(APP_ROLES.SELLER);
              const isSelf = user.userId === currentUser?.id;
              return (
                <tr key={user.userId} className="border-t border-border">
                  <td className="px-5 py-3 font-medium text-ink">{user.userName}</td>
                  <td className="px-5 py-3 text-ink-muted">{user.email}</td>
                  <td className="px-5 py-3 text-ink-muted">{user.roles.join(', ')}</td>
                  <td className="px-5 py-3">
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSeller}
                        disabled={updateRoles.isPending}
                        onChange={() => toggleRole(user.userId, user.roles, APP_ROLES.SELLER)}
                        className="h-4 w-4 accent-accent disabled:opacity-40"
                      />
                      <span className="text-xs text-ink-muted">{isSeller ? 'Seller' : 'Make seller'}</span>
                    </label>
                  </td>
                  <td className="px-5 py-3">
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isAdmin}
                        disabled={isSelf || updateRoles.isPending}
                        onChange={() => toggleRole(user.userId, user.roles, APP_ROLES.ADMIN)}
                        className="h-4 w-4 accent-accent disabled:opacity-40"
                      />
                      <span className="text-xs text-ink-muted">{isSelf ? 'You' : isAdmin ? 'Admin' : 'Grant admin'}</span>
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {usersQuery.isError && (
          <div className="p-6">
            <ErrorState description="Couldn't load users." onRetry={() => usersQuery.refetch()} />
          </div>
        )}
      </div>
    </div>
  );
}
