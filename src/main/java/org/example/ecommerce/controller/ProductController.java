package org.example.ecommerce.controller;


import jakarta.validation.Valid;
import org.example.ecommerce.config.AppConstants;
import org.example.ecommerce.payload.ProductDTO;
import org.example.ecommerce.payload.ProductResponse;
import org.example.ecommerce.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api")
public class ProductController {
    @Autowired
    ProductService productService;
    @PostMapping("/admin/categories/{categoryId}/product")
    public ResponseEntity<ProductDTO> addProduct(@Valid @RequestBody ProductDTO productDTO,
                                                  @PathVariable Long categoryId){
        ProductDTO savedProductDTO= productService.addProduct(categoryId,productDTO);
        return new ResponseEntity<>(savedProductDTO, HttpStatus.CREATED);
    }
    @GetMapping("/public/products")
    public ResponseEntity<ProductResponse> getAllProducts(
            @RequestParam(name ="pageNumber", defaultValue= AppConstants.PAGE_NUMBER,required = false) Integer pageNumber,
            @RequestParam(name="pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name="sortBy" , defaultValue = AppConstants.SORT_PRODUCTS_BY , required = false) String sortBy,
            @RequestParam(name="sortOrder", defaultValue = AppConstants.SORT_DIR , required = false) String sortOrder
    ){
        ProductResponse productResponse = productService.getAllProducts(pageNumber,pageSize,sortBy,sortOrder);
        return new ResponseEntity<>(productResponse,HttpStatus.OK);
    }

    @GetMapping("/public/categories/{categoryId}/products")
    public ResponseEntity<ProductResponse> getProductsByCategory(@PathVariable Long categoryId,
                                                                 @RequestParam(name ="pageNumber", defaultValue= AppConstants.PAGE_NUMBER,required = false) Integer pageNumber,
                                                                 @RequestParam(name="pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
                                                                 @RequestParam(name="sortBy" , defaultValue = AppConstants.SORT_PRODUCTS_BY , required = false) String sortBy,
                                                                 @RequestParam(name="sortOrder", defaultValue = AppConstants.SORT_DIR , required = false) String sortOrder
                                                                 ){
        ProductResponse productResponse = productService.searchByCategory(categoryId,pageNumber,pageSize,sortBy,sortOrder);
        return new ResponseEntity<>(productResponse, HttpStatus.OK);
    }
    @GetMapping("/public/products/keyword/{keyword}")
    public ResponseEntity<ProductResponse> getProductsByKeyword(@PathVariable String keyword,
                                                                @RequestParam(name ="pageNumber", defaultValue= AppConstants.PAGE_NUMBER,required = false) Integer pageNumber,
                                                                @RequestParam(name="pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
                                                                @RequestParam(name="sortBy" , defaultValue = AppConstants.SORT_PRODUCTS_BY , required = false) String sortBy,
                                                                @RequestParam(name="sortOrder", defaultValue = AppConstants.SORT_DIR , required = false) String sortOrder
    ){
       ProductResponse productResponse= productService.searchProductByKeyword(keyword,pageNumber,pageSize,sortBy,sortOrder);
        return new ResponseEntity<>(productResponse,HttpStatus.OK);
    }
    @PutMapping("/admin/product/{productId}")
    public ResponseEntity<ProductDTO> updateProduct(@Valid @RequestBody ProductDTO productDTO,@PathVariable Long productId){
        ProductDTO updatedProductDTO=productService.updateProduct(productId, productDTO);
        return new ResponseEntity<>(updatedProductDTO,HttpStatus.OK);
    }
    @DeleteMapping("/admin/product/{productId}")
    public ResponseEntity<ProductDTO> deleteProductById(@PathVariable Long productId){
        ProductDTO deletedProduct=productService.deleteProduct(productId);
        return new ResponseEntity<>(deletedProduct,HttpStatus.OK);
    }
    @PutMapping("/admin/products/{productId}/image")
    public ResponseEntity<ProductDTO> updateProductImage(@PathVariable Long productId, @RequestParam("image") MultipartFile image) throws IOException {
        ProductDTO updatedProduct = productService.updateProductImage(productId,image);
        return new ResponseEntity<>(updatedProduct,HttpStatus.OK);
    }
}
