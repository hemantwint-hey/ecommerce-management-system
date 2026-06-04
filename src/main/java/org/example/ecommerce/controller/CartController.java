package org.example.ecommerce.controller;

import org.apache.coyote.Response;
import org.example.ecommerce.model.Cart;
import org.example.ecommerce.payload.CartDTO;
import org.example.ecommerce.repositories.CartRepository;
import org.example.ecommerce.service.CartService;
import org.example.ecommerce.util.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CartController {

    @Autowired
    private CartService cartService;
    @Autowired
    private AuthUtil authUtil;
    @Autowired
    private CartRepository cartRepository;


    @PostMapping("/carts/products/{productId}/quantity/{quantity}")
    public ResponseEntity<CartDTO> addProductToCart(@PathVariable  Long productId, @PathVariable Integer quantity){
            CartDTO cartDTO = cartService.addProductToCart(productId,quantity);
            return new ResponseEntity<CartDTO>(cartDTO, HttpStatus.CREATED);
    }

    @GetMapping("/carts")
    public ResponseEntity<List<CartDTO>> getCarts(){
        List<CartDTO> cartDTOS = cartService.getAllCarts();
        return new ResponseEntity<List<CartDTO>>(cartDTOS, HttpStatus.FOUND);
    }
    @GetMapping("/carts/users/cart")
    public ResponseEntity<CartDTO> getCartById(){
        String emailID = authUtil.loggedInEmail();
        Cart cart = cartRepository.findCartByEmail(emailID);
        Long cartId = cart.getCartId();

        CartDTO cartDTO = cartService.getCart(emailID, cartId);
        return new ResponseEntity<>(cartDTO, HttpStatus.OK);
    }
    @PutMapping("/cart/products/{productId}/quantity/{operation}")
    public ResponseEntity<CartDTO> updateCartProduct(@PathVariable Long productId,
                                                     @PathVariable String operation){
        CartDTO cartDTO = cartService.updateProductQuantityInCart(productId,operation.equalsIgnoreCase("delete")?-1:1);
        return new ResponseEntity<>(cartDTO, HttpStatus.OK);
    }
    @DeleteMapping("/carts/{cartId}/products/{productId}")
    public ResponseEntity<String> deleteProductFromCart(Long cartId, Long productId){
        String status = cartService.deleteProductFromCart(cartId,productId);
        return new ResponseEntity<>(status, HttpStatus.OK);
    }
}
