package org.example.ecommerce.service;

import org.example.ecommerce.model.Cart;
import org.example.ecommerce.payload.CartDTO;
import org.example.ecommerce.repositories.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CartServiceImpl implements  CartService{
    @Autowired
    CartRepository cartRepository;

    @Autowired
    AuthUtil authUtil;
    @Override
    public CartDTO addProductToCart(Long productId, Integer quantity) {
        // find the existing cart or create one
        Cart userCart = cartRepository.findCartByEmail(authUtil.loggedInEmail());
        // retrieve product details
        // perform validations
        // create cart item
        //save cart item
        // return updated cart
        return null;
    }
    private Cart createCart(){
         Cart userCart = cartRepository.findCartByEmail(authUtil.loggedInEmail());
         if(userCart != null)return userCart;
         Cart cart = new Cart();
         cart.setTotalPrice(0.00);
         cart.setUser(authUtil.logge);
    }
}
