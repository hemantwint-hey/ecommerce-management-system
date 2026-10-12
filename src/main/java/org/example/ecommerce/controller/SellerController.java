package org.example.ecommerce.controller;

import jakarta.validation.Valid;
import org.example.ecommerce.config.AppConstants;
import org.example.ecommerce.payload.OrderDTO;
import org.example.ecommerce.payload.ProductDTO;
import org.example.ecommerce.payload.ProductResponse;
import org.example.ecommerce.service.OrderService;
import org.example.ecommerce.service.ProductService;
import org.example.ecommerce.util.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Seller panel API. SecurityConfig restricts /api/seller/** to ROLE_SELLER and ROLE_ADMIN;
 * on top of that, every write checks that the product belongs to the logged-in seller.
 */
@RestController
@RequestMapping("/api/seller")
public class SellerController {

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private AuthUtil authUtil;

    @GetMapping("/products")
    public ResponseEntity<ProductResponse> getMyProducts(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_PRODUCTS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {
        ProductResponse response = productService.getProductsBySeller(
                authUtil.loggedInUserId(), pageNumber, pageSize, sortBy, sortOrder);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/categories/{categoryId}/product")
    public ResponseEntity<ProductDTO> addProduct(@Valid @RequestBody ProductDTO productDTO, @PathVariable Long categoryId) {
        return new ResponseEntity<>(productService.addProduct(categoryId, productDTO), HttpStatus.CREATED);
    }

    @PutMapping("/products/{productId}")
    public ResponseEntity<ProductDTO> updateProduct(@Valid @RequestBody ProductDTO productDTO, @PathVariable Long productId) {
        productService.verifyProductOwnership(productId);
        return ResponseEntity.ok(productService.updateProduct(productId, productDTO));
    }

    @PutMapping("/products/{productId}/image")
    public ResponseEntity<ProductDTO> updateProductImage(@PathVariable Long productId,
                                                         @RequestParam("image") MultipartFile image) throws IOException {
        productService.verifyProductOwnership(productId);
        return ResponseEntity.ok(productService.updateProductImage(productId, image));
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<ProductDTO> deleteProduct(@PathVariable Long productId) {
        productService.verifyProductOwnership(productId);
        return ResponseEntity.ok(productService.deleteProduct(productId));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderDTO>> getMyOrders() {
        return ResponseEntity.ok(orderService.getOrdersForSeller(authUtil.loggedInUserId()));
    }
}
