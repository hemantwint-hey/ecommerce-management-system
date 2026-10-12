package org.example.ecommerce.repositories;

import org.example.ecommerce.model.Category;
import org.example.ecommerce.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository  extends JpaRepository<Product,Long> {
    Page<Product> findByCategoryOrderByPriceAsc(Category category, Pageable pageDetails);

    Page<Product> findByCategory(Category category, Pageable pageDetails);

    Page<Product> findByProductNameLikeIgnoreCase(String productName, Pageable pageDetails);

    Page<Product> findByUser_UserId(Long userId, Pageable pageDetails);

    /**
     * Check-and-decrement in one statement: the stock check and the write can't be split by another buyer.
     * InnoDB row-locks the product until the transaction ends, so a concurrent buyer waits, re-evaluates
     * "quantity >= qty" against the committed value, and gets 0 rows when the stock is gone.
     * Returns the number of rows updated: 1 = reserved, 0 = not enough stock.
     */
    @Modifying
    @Query("UPDATE Product p SET p.quantity = p.quantity - :qty WHERE p.productId = :id AND p.quantity >= :qty")
    int decrementStock(@Param("id") Long productId, @Param("qty") int quantity);
}
