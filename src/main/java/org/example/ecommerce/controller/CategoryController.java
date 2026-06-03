package org.example.ecommerce.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.apache.coyote.Response;
import org.example.ecommerce.config.AppConstants;
import org.example.ecommerce.model.Category;
import org.example.ecommerce.payload.CartDTO;
import org.example.ecommerce.payload.CategoryDTO;
import org.example.ecommerce.payload.CategoryResponse;
import org.example.ecommerce.service.CartService;
import org.example.ecommerce.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CategoryController {

    private final CategoryService categoryService;
    private final CartService cartService;

    // Constructor Injection (Best Practice)
    public CategoryController(CategoryService categoryService, CartService cartService) {
        this.categoryService = categoryService;
        this.cartService = cartService;
    }

    // GET all categories
    @GetMapping("/public/categories")
    public ResponseEntity<CategoryResponse> getAllCategories(
            @RequestParam(name="pageNumber", defaultValue=AppConstants.PAGE_NUMBER , required = false)Integer pageNumber,
            @RequestParam(name="pageSize", defaultValue=AppConstants.PAGE_SIZE , required = false)Integer pageSize,
            @RequestParam(name="sortBy", defaultValue = AppConstants.SORT_CATEGORIES_BY,required=false) String sortBy,
            @RequestParam(name="sortOrder", defaultValue = AppConstants.SORT_DIR,required=false )String sortOrder
            ) {
        CategoryResponse categoryResponse=categoryService.getAllCategories(pageNumber,pageSize,sortBy,sortOrder);
        return ResponseEntity.ok(categoryResponse);
    }

    // CREATE category
    @PostMapping(
            value = "/public/categories",
            consumes = "application/json"
    )
    public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
        CategoryDTO savedCategoryDTO=categoryService.createCategory(categoryDTO);
        return new ResponseEntity<>(savedCategoryDTO,HttpStatus.CREATED);
    }

    // UPDATE category
    @PutMapping(
            value = "/public/categories/{categoryId}",
            consumes = "application/json"
    )
    public ResponseEntity<CategoryDTO> updateCategory(
            @RequestBody CategoryDTO categoryDTO,
            @PathVariable Long categoryId) {

       CategoryDTO savedCategoryDTO= categoryService.updateCategory(categoryDTO, categoryId);
        return new ResponseEntity<>(savedCategoryDTO,HttpStatus.OK);
    }

    // DELETE category
    @DeleteMapping("/admin/categories/{categoryId}")
    public ResponseEntity<CategoryDTO> deleteCategory(@PathVariable Long categoryId) {
        CategoryDTO status = categoryService.deleteCategory(categoryId);
        return ResponseEntity.ok(status);
    }

    @PutMapping("/carts/products/{productId}/quantity/{operation}")
    public ResponseEntity<CartDTO> updateCartProduct(@PathVariable Long productId,@PathVariable String operation){
         CartDTO cartDTO = cartService.updateProductQuantityInCart(productId, operation.equalsIgnoreCase("delete")?-1:1);
         return new ResponseEntity<CartDTO>(cartDTO, HttpStatus.OK);
    }
}
