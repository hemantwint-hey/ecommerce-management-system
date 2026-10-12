import { useEffect } from 'react';
import { onUnauthorized } from '@/api/client';
import { fetchCurrentUser, sessionExpired } from './authSlice';
import { clearCart, fetchCart } from './cartSlice';
import { useAppDispatch, useAppSelector } from './index';

/** Restores the session from the cookie on load and keeps the cart in step with whoever is signed in. */
export function SessionManager() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.id);

  useEffect(() => {
    dispatch(fetchCurrentUser());
    onUnauthorized(() => dispatch(sessionExpired()));
  }, [dispatch]);

  useEffect(() => {
    if (userId === undefined) dispatch(clearCart());
    else dispatch(fetchCart());
  }, [dispatch, userId]);

  return null;
}
