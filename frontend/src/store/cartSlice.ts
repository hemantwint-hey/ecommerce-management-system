import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { cartApi } from '@/api/cartApi';
import type { CartDTO } from '@/types/models';
import { getErrorMessage } from '@/utils/errors';
import type { RootState } from './index';

export const EMPTY_CART: CartDTO = { cartId: 0, totalPrice: 0, products: [] };

interface CartState {
  cart: CartDTO;
  /** True once the cart has been fetched for the signed-in user (so refetches don't flash a skeleton). */
  loaded: boolean;
  error: string | null;
  isAdding: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
}

const initialState: CartState = {
  cart: EMPTY_CART,
  loaded: false,
  error: null,
  isAdding: false,
  isUpdating: false,
  isRemoving: false,
};

type ThunkConfig = { state: RootState; rejectValue: string };

export const fetchCart = createAsyncThunk<CartDTO, void, ThunkConfig>('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    return await cartApi.getMyCart();
  } catch (error) {
    // The backend answers 404 until the user's first add-to-cart creates their cart.
    if (error instanceof AxiosError && error.response?.status === 404) return EMPTY_CART;
    return rejectWithValue(getErrorMessage(error));
  }
});

export const addToCart = createAsyncThunk<void, { productId: number; quantity: number }, ThunkConfig>(
  'cart/add',
  async ({ productId, quantity }, { dispatch, rejectWithValue }) => {
    try {
      await cartApi.addProduct(productId, quantity);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
    // The add-to-cart response's product list can be stale right after creating a cart item,
    // so refetch instead of trusting it.
    await dispatch(fetchCart());
  },
);

export const changeQuantity = createAsyncThunk<
  CartDTO,
  { productId: number; direction: 'increase' | 'decrease' },
  ThunkConfig
>('cart/changeQuantity', async ({ productId, direction }, { rejectWithValue }) => {
  try {
    return await cartApi.changeQuantity(productId, direction);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const removeFromCart = createAsyncThunk<void, number, ThunkConfig>(
  'cart/remove',
  async (productId, { getState, dispatch, rejectWithValue }) => {
    try {
      await cartApi.removeProduct(getState().cart.cart.cartId, productId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
    await dispatch(fetchCart());
  },
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.loaded = true;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.error = action.payload ?? 'Could not load your cart.';
      })
      .addCase(addToCart.pending, (state) => {
        state.isAdding = true;
      })
      .addCase(addToCart.fulfilled, (state) => {
        state.isAdding = false;
      })
      .addCase(addToCart.rejected, (state) => {
        state.isAdding = false;
      })
      .addCase(changeQuantity.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(changeQuantity.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.cart = action.payload;
      })
      .addCase(changeQuantity.rejected, (state) => {
        state.isUpdating = false;
      })
      .addCase(removeFromCart.pending, (state) => {
        state.isRemoving = true;
      })
      .addCase(removeFromCart.fulfilled, (state) => {
        state.isRemoving = false;
      })
      .addCase(removeFromCart.rejected, (state) => {
        state.isRemoving = false;
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
