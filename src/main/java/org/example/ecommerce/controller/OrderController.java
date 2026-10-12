package org.example.ecommerce.controller;

import jakarta.validation.Valid;
import org.example.ecommerce.model.Order;
import org.example.ecommerce.payload.OrderDTO;
import org.example.ecommerce.payload.OrderRequestDTO;
import org.example.ecommerce.payload.OrderStatusUpdateDTO;
import org.example.ecommerce.payload.StripePaymentDTO;
import org.example.ecommerce.service.OrderService;
import org.example.ecommerce.util.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private AuthUtil authUtil;

    // Creates a Stripe PaymentIntent for the current user's cart; the amount is computed here, never by the client.
    @PostMapping("/order/stripe-client-secret")
    public ResponseEntity<StripePaymentDTO> createStripePaymentIntent() {
        String emailId = authUtil.loggedInEmail();
        return new ResponseEntity<>(orderService.createStripePaymentIntent(emailId), HttpStatus.CREATED);
    }

    // The comma form is the original route and stays for backward compatibility.
    @PostMapping({"/order/users/payments/{paymentMethod}", "/order/users/payments,{paymentMethod}"})
    public ResponseEntity<OrderDTO> orderProducts(@PathVariable String paymentMethod , @RequestBody OrderRequestDTO orderRequestDTO){
        String emailId = authUtil.loggedInEmail();
       OrderDTO order =  orderService.placeOrder(
                emailId,
                orderRequestDTO.getAddressId(),
                paymentMethod,
                orderRequestDTO.getPgName(),
                orderRequestDTO.getPgPaymentId(),
                orderRequestDTO.getPgStatus(),
                orderRequestDTO.getPgResponseMessage()

        );
       return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @GetMapping("/orders/users")
    public ResponseEntity<List<OrderDTO>> getOrdersForCurrentUser(){
        String emailId = authUtil.loggedInEmail();
        return ResponseEntity.ok(orderService.getOrdersByUser(emailId));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long orderId, Authentication authentication){
        String emailId = authUtil.loggedInEmail();
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN"));
        return ResponseEntity.ok(orderService.getOrderById(emailId, orderId, isAdmin));
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<List<OrderDTO>> getAllOrders(){
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/admin/orders/{orderId}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(@PathVariable Long orderId, @Valid @RequestBody OrderStatusUpdateDTO orderStatusUpdateDTO){
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, orderStatusUpdateDTO.getStatus()));
    }
}
