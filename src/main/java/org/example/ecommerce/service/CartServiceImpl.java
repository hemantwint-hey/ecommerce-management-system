package org.example.ecommerce.service;

import org.example.ecommerce.exceptions.APIException;
import org.example.ecommerce.exceptions.ResourceNotFoundException;
import org.example.ecommerce.model.Cart;
import org.example.ecommerce.model.CartItem;
import org.example.ecommerce.model.Product;
import org.example.ecommerce.payload.CartDTO;
import org.example.ecommerce.payload.ProductDTO;
import org.example.ecommerce.repositories.CartItemRepository;
import org.example.ecommerce.repositories.CartRepository;
import org.example.ecommerce.repositories.ProductRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Stream;

@Service
public class CartServiceImpl implements  CartService{
    @Autowired
    CartRepository cartRepository;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    ModelMapper modelMapper;

    @Autowired
    AuthUtil authUtil;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Override
    public CartDTO addProductToCart(Long productId, Integer quantity) {
        // find the existing cart or create one
        Cart cart = createCart();
        // retrieve product details
        Product product = productRepository.findById(productId).orElseThrow(()-> new ResourceNotFoundException("Product", "productId", productId));
        // perform validations
        CartItem cartItem = cartItemRepository.findCartItemByProductIdAndCartId(
                cart.getCartId(),
                productId
        );
        if(cartItem != null)throw new APIException("Product " + product.getProductName() + "already exists in the cart");

        if( product.getQuantity() == 0)throw  new APIException(product.getProductName() + "is not available");

        if( product.getQuantity() < quantity )throw  new APIException("Please, make an order of the " + product.getProductName() + " less than or equal to the quantity"
                + product.getQuantity()+".");
        // create cart item
        CartItem newCartItem = new CartItem();

        newCartItem.setProduct(product);
        newCartItem.setCart(cart);
        newCartItem.setQuantity(quantity);
        newCartItem.setDiscount(product.getDiscount());
        newCartItem.setProductPrice(product.getSpecialPrice());
        //save cart item
        cartItemRepository.save(newCartItem);
        product.setQuantity(product.getQuantity());
        cart.setTotalPrice(cart.getTotalPrice() + (product.getSpecialPrice() * quantity));
        cartRepository.save(cart);

        // return updated cart
        CartDTO cartDtO =  modelMapper.map(cart,CartDTO.class);

        List<CartItem> cartItems = cart.getCartItems();
        Stream<ProductDTO> productDTOStream =  cartItems.stream().map(item -> {
            ProductDTO map = modelMapper.map(item.getProduct(),ProductDTO.class);
            map.setQuantity(item.getQuantity());
            return map;
        });

        cartDtO.setProducts(productDTOStream.toList());
        return cartDtO ;
    }
    private Cart createCart(){
         Cart userCart = cartRepository.findCartByEmail(authUtil.loggedInEmail());
         if(userCart != null)return userCart;
         Cart cart = new Cart();
         cart.setTotalPrice(0.00);
         cart.setUser(authUtil.loggedInUser());
         Cart newCart = cartRepository.save(cart);
         return newCart;
    }
}
