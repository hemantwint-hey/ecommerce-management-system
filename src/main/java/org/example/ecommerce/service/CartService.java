package org.example.ecommerce.service;

import jakarta.transaction.Transactional;
import org.example.ecommerce.payload.CartDTO;
import org.springframework.stereotype.Service;

import java.util.List;


public interface CartService {
     CartDTO addProductToCart(Long productId, Integer quantity);

    List<CartDTO> getAllCarts();

    CartDTO getCart(String emailID, Long cartId);

    @Transactional
    CartDTO updateProductQuantityInCart(Long productId, Integer quantity);

    String deleteProductFromCart(Long cartId, Long productId);
}
