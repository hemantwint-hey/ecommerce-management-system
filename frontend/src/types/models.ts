// These interfaces mirror the backend DTOs field-for-field (see payload/*.java).
// Do not add fields the backend does not actually return.

export interface ProductDTO {
  productId: number;
  productName: string;
  description: string;
  image: string;
  /**
   * Stock quantity on /public/products responses.
   * Inside a CartDTO/OrderItemDTO, the backend reuses this same field to carry
   * the quantity held in the cart/order instead — the API does not distinguish.
   */
  quantity: number;
  price: number;
  discount: number;
  specialPrice: number;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}

export type ProductResponse = PagedResponse<ProductDTO>;

export interface CategoryDTO {
  categoryId: number;
  categoryName: string;
}

export type CategoryResponse = PagedResponse<CategoryDTO>;

export interface CartDTO {
  cartId: number;
  totalPrice: number;
  products: ProductDTO[];
}

export interface AddressDTO {
  addressId: number;
  street: string;
  buildingName: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface PaymentDTO {
  paymentId: number;
  paymentMethod: string;
  pgPaymentId: string | null;
  pgStatus: string | null;
  pgResponseMessage: string | null;
  pgName: string | null;
}

export interface OrderItemDTO {
  orderItemId: number;
  product: ProductDTO;
  quantity: number;
  discount: number;
  orderedProductPrice: number;
}

export interface OrderDTO {
  orderId: number;
  email: string;
  orderItems: OrderItemDTO[];
  orderDate: string;
  /** null on /seller/orders, where sellers don't see the buyer's payment details. */
  payment: PaymentDTO | null;
  totalAmount: number;
  orderStatus: string;
  addressId: number;
}

/**
 * The backend decides payment status itself; for Stripe the only field it uses is pgPaymentId
 * (the PaymentIntent id), which it then verifies with Stripe.
 */
export interface OrderRequestDTO {
  addressId: number;
  pgPaymentId?: string;
}

export interface StripePaymentDTO {
  clientSecret: string;
  paymentIntentId: string;
  /** Smallest currency unit (paise for INR). */
  amount: number;
  currency: string;
}

export interface UserInfoResponse {
  id: number;
  jwtToken: string;
  username: string;
  roles: string[];
}

export interface MessageResponse {
  message: string;
}

export interface UserDTO {
  userId: number;
  userName: string;
  email: string;
  roles: string[];
}

export const APP_ROLES = {
  USER: 'ROLE_USER',
  SELLER: 'ROLE_SELLER',
  ADMIN: 'ROLE_ADMIN',
} as const;

/** The only payment methods the backend accepts (see OrderServiceImpl.buildVerifiedPayment). */
export const PAYMENT_METHODS = ['CASH_ON_DELIVERY', 'STRIPE'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
