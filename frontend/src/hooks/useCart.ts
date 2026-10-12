import { useToast } from '@/contexts/ToastContext';
import { useAppDispatch, useAppSelector } from '@/store';
import { addToCart, changeQuantity, removeFromCart } from '@/store/cartSlice';
import { useAuth } from './useAuth';

/** Cart state lives in the Redux store (store/cartSlice.ts); this hook adds toasts around its thunks. */
export function useCart() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { cart, loaded, error, isAdding, isUpdating, isRemoving } = useAppSelector((state) => state.cart);

  const run = async (action: Promise<unknown>, successMessage?: string) => {
    try {
      await action;
      if (successMessage) showToast(successMessage, 'success');
      return true;
    } catch (message) {
      showToast(typeof message === 'string' ? message : 'Something went wrong. Please try again.', 'error');
      return false;
    }
  };

  return {
    cart,
    itemCount: cart.products.reduce((sum, item) => sum + item.quantity, 0),
    isLoading: isAuthenticated && !loaded && !error,
    isError: !loaded && !!error,
    isAdding,
    isUpdating,
    isRemoving,
    addToCart: (productId: number, quantity: number) =>
      run(dispatch(addToCart({ productId, quantity })).unwrap(), 'Added to cart'),
    changeQuantity: (productId: number, direction: 'increase' | 'decrease') =>
      run(dispatch(changeQuantity({ productId, direction })).unwrap()),
    removeFromCart: (productId: number) => run(dispatch(removeFromCart(productId)).unwrap()),
  };
}
