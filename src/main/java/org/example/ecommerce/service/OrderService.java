package org.example.ecommerce.service;

import jakarta.transaction.Transactional;
import org.example.ecommerce.payload.OrderDTO;
import org.example.ecommerce.payload.StripePaymentDTO;

import java.util.List;

public interface OrderService {
    @Transactional
    OrderDTO placeOrder(String emailId, Long addressId, String paymentMethod, String pgName, String pgPaymentId, String pgStatus, String pgResponseMessage);

    List<OrderDTO> getOrdersByUser(String email);

    OrderDTO getOrderById(String email, Long orderId, boolean isAdmin);

    List<OrderDTO> getAllOrders();

    OrderDTO updateOrderStatus(Long orderId, String status);

    StripePaymentDTO createStripePaymentIntent(String emailId);

    List<OrderDTO> getOrdersForSeller(Long sellerId);
}
