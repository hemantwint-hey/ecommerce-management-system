package org.example.ecommerce.service;

import jakarta.transaction.Transactional;
import org.example.ecommerce.payload.OrderDTO;

public interface OrderService {
    @Transactional
    OrderDTO placeOrder(String emailId, Long addressId, String paymentMethod, String pgName, String pgPaymentId, String pgStatus, String pgResponseMessage);
}
