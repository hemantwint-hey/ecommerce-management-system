import { useQueryClient } from '@tanstack/react-query';
import type { LoginPayload, SignupPayload } from '@/api/authApi';
import { useAppDispatch, useAppSelector } from '@/store';
import { login, logout, signup } from '@/store/authSlice';
import { APP_ROLES } from '@/types/models';

export function useAuth() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const auth = useAppSelector((state) => state.auth);
  const roles = auth.user?.roles ?? [];

  return {
    user: auth.user,
    isLoading: auth.status !== 'ready',
    isAuthenticated: !!auth.user,
    isAdmin: roles.includes(APP_ROLES.ADMIN),
    isSeller: roles.includes(APP_ROLES.SELLER),
    login: async (payload: LoginPayload) => {
      await dispatch(login(payload)).unwrap();
    },
    /** Rejects with a SignupError ({ message, fieldErrors }). */
    signup: async (payload: SignupPayload) => {
      await dispatch(signup(payload)).unwrap();
    },
    logout: async () => {
      await dispatch(logout()).unwrap();
      // Drop cached orders, addresses and admin data so the next user never sees them.
      queryClient.clear();
    },
    loginError: auth.loginError,
    isLoggingIn: auth.isLoggingIn,
    signupError: auth.signupError,
    isSigningUp: auth.isSigningUp,
  };
}
