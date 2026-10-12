package org.example.ecommerce.service;

import jakarta.transaction.Transactional;
import org.example.ecommerce.exceptions.APIException;
import org.example.ecommerce.exceptions.ResourceNotFoundException;
import org.example.ecommerce.model.*;
import org.example.ecommerce.payload.OrderDTO;
import org.example.ecommerce.payload.OrderItemDTO;
import org.example.ecommerce.payload.StripePaymentDTO;
import org.example.ecommerce.repositories.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {
    @Autowired
    CartRepository cartRepository;

    @Autowired
    AddressRepository addressRepository;

    @Autowired
    PaymentRepository paymentRepository;

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    OrderItemRepository orderItemRepository;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    ModelMapper modelMapper;

    @Autowired
    private StripeService stripeService;

    public static final String PAYMENT_COD = "CASH_ON_DELIVERY";
    public static final String PAYMENT_STRIPE = "STRIPE";

    @Override
    public StripePaymentDTO createStripePaymentIntent(String emailId) {
        Cart cart = cartRepository.findCartByEmail(emailId);
        if (cart == null) {
            throw new ResourceNotFoundException("Cart", "email", emailId);
        }
        // Fail before the customer is charged rather than after.
        validateCartForCheckout(cart);
        return stripeService.createPaymentIntent(emailId, cart.getTotalPrice());
    }

    private List<CartItem> validateCartForCheckout(Cart cart) {
        List<CartItem> cartItems = new ArrayList<>(cart.getCartItems());
        if (cartItems.isEmpty()) {
            throw new APIException("Cart is Empty");
        }
        cartItems.forEach(item -> {
            if (item.getProduct().getQuantity() < item.getQuantity()) {
                throw new APIException("Insufficient stock for product " + item.getProduct().getProductName());
            }
        });
        return cartItems;
    }

    /**
     * Payment details are decided on the server. For Stripe, the only thing taken from the client is the
     * PaymentIntent id, and Stripe itself is asked whether it succeeded.
     */
    private Payment buildVerifiedPayment(String emailId, Cart cart, String paymentMethod, String pgPaymentId) {
        if (PAYMENT_COD.equalsIgnoreCase(paymentMethod)) {
            return new Payment(PAYMENT_COD, null, "PENDING", "Pay on delivery", null);
        }
        if (PAYMENT_STRIPE.equalsIgnoreCase(paymentMethod)) {
            if (paymentRepository.existsByPgPaymentId(pgPaymentId)) {
                throw new APIException("This payment has already been used for an order");
            }
            stripeService.verifyPaymentIntent(pgPaymentId, emailId, cart.getTotalPrice());
            return new Payment(PAYMENT_STRIPE, pgPaymentId, "succeeded", "Payment captured by Stripe", "Stripe");
        }
        throw new APIException("Unsupported payment method: " + paymentMethod);
    }

    @Override
    @Transactional
    public OrderDTO placeOrder(String emailId, Long addressId, String paymentMethod, String pgName, String pgPaymentId, String pgStatus, String pgResponseMessage) {
        // getting user cart
        Cart cart  = cartRepository.findCartByEmail(emailId);
        if(cart == null){
            throw new ResourceNotFoundException("Cart", "email" ,emailId);
        }
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address","AddressId",addressId));
        if (!address.getUser().getEmail().equals(emailId)) {
            throw new ResourceNotFoundException("Address", "AddressId", addressId);
        }
        List<CartItem> cartItems = validateCartForCheckout(cart);

        Payment payment = buildVerifiedPayment(emailId, cart, paymentMethod, pgPaymentId);

        // create a new order with the payment info
        Order order = new Order();
        order.setEmail(emailId);
        order.setOrderDate(LocalDate.now());
        order.setTotalAmount(cart.getTotalPrice());
        order.setOrderStatus("Order Accepted !");
        order.setAddress(address);
        payment.setOrder(order);
        payment = paymentRepository.save(payment);
        order.setPayment(payment);

        Order savedOrder = orderRepository.save(order);
        List<OrderItem> orderItems = new ArrayList<>();
        for(CartItem cartItem : cartItems){
            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setDiscount(cartItem.getDiscount());
            orderItem.setOrderedProductPrice(cartItem.getProductPrice());
            orderItem.setOrder(savedOrder);
            orderItems.add(orderItem);
        }

       orderItems =  orderItemRepository.saveAll(orderItems);

        // update product stock
        cartItems.forEach(item -> {
            int quantity = item.getQuantity();
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() - quantity);
            productRepository.save(product);
            // clear the cart
            cartService.deleteProductFromCart(cart.getCartId(),item.getProduct().getProductId());
        });

        // send back the order summary
        OrderDTO orderDTO = modelMapper.map(savedOrder, OrderDTO.class);
        orderItems.forEach(
                item -> orderDTO.getOrderItems().add(modelMapper
                        .map(item, OrderItemDTO.class)));
        orderDTO.setAddressId(addressId);
        return orderDTO;
    }

    @Override
    @Transactional
    public List<OrderDTO> getOrdersByUser(String email) {
        List<Order> orders = orderRepository.findByEmailOrderByOrderDateDesc(email);
        return orders.stream().map(this::mapOrderToDTO).toList();
    }

    @Override
    @Transactional
    public OrderDTO getOrderById(String email, Long orderId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderId", orderId));
        if (!isAdmin && !order.getEmail().equals(email)) {
            throw new ResourceNotFoundException("Order", "orderId", orderId);
        }
        return mapOrderToDTO(order);
    }

    @Override
    @Transactional
    public List<OrderDTO> getAllOrders() {
        List<Order> orders = orderRepository.findAllByOrderByOrderDateDesc();
        return orders.stream().map(this::mapOrderToDTO).toList();
    }

    @Override
    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderId", orderId));
        order.setOrderStatus(status);
        Order savedOrder = orderRepository.save(order);
        return mapOrderToDTO(savedOrder);
    }

    @Override
    @Transactional
    public List<OrderDTO> getOrdersForSeller(Long sellerId) {
        List<Order> orders = orderRepository.findOrdersContainingSellerProducts(sellerId);
        return orders.stream().map(order -> {
            OrderDTO orderDTO = mapOrderToDTO(order);
            // A seller only sees their own lines of a shared order, and the total of those lines.
            List<OrderItemDTO> sellerItems = order.getOrderItems().stream()
                    .filter(item -> item.getProduct().getUser() != null
                            && sellerId.equals(item.getProduct().getUser().getUserId()))
                    .map(item -> modelMapper.map(item, OrderItemDTO.class))
                    .toList();
            orderDTO.setOrderItems(sellerItems);
            orderDTO.setTotalAmount(sellerItems.stream()
                    .mapToDouble(item -> item.getOrderedProductPrice() * item.getQuantity())
                    .sum());
            orderDTO.setPayment(null);
            return orderDTO;
        }).toList();
    }

    private OrderDTO mapOrderToDTO(Order order) {
        OrderDTO orderDTO = modelMapper.map(order, OrderDTO.class);
        List<OrderItemDTO> orderItemDTOS = order.getOrderItems().stream()
                .map(item -> modelMapper.map(item, OrderItemDTO.class))
                .toList();
        orderDTO.setOrderItems(orderItemDTOS);
        orderDTO.setAddressId(order.getAddress() != null ? order.getAddress().getAddressId() : null);
        return orderDTO;
    }
}
