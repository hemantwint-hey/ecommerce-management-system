package org.example.ecommerce.service;

import jakarta.transaction.Transactional;
import org.example.ecommerce.exceptions.ResourceNotFoundException;
import org.example.ecommerce.model.Address;
import org.example.ecommerce.model.Cart;
import org.example.ecommerce.model.Order;
import org.example.ecommerce.payload.OrderDTO;
import org.example.ecommerce.repositories.AddressRepository;
import org.example.ecommerce.repositories.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;

public class OrderServiceImpl implements OrderService {
    @Autowired
    CartRepository cartRepository;

    @Autowired
    AddressRepository addressRepository

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
        // create a new order with the payment info

        Order order = new Order();
        order.setEmail(emailId);
        order.setOrderDate(LocalDate.now());
        order.setTotalAmount(cart.getTotalPrice());
        order.setOrderStatus("Order Accepted !");
        // get items from the cart into the order items

        // update product stock
        // clear the cart
        // send back the order summary
        return null;
    }
}
