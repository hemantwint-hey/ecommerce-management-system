package org.example.ecommerce.repositories;

import org.example.ecommerce.model.Category;
import org.example.ecommerce.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository  extends JpaRepository<Product,Long> {
    Page<Product> findByCategoryOrderByPriceAsc(Category category, Pageable pageDetails);

    Page<Product> findByCategory(Category category, Pageable pageDetails);

    Page<Product> findByProductNameLikeIgnoreCase(String productName, Pageable pageDetails);
}
