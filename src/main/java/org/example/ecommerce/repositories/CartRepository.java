package org.example.ecommerce.repositories;

import org.example.ecommerce.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CartRepository extends JpaRepository<Cart,Long> {
    @Query("Select c from Cart c where c.user.email = ?1")
    Cart findCartByEmail(String email);

    @Query("Select c from Cart c where c.user.email = ?1 AND c.cartId = ?2")
    Cart findCartByEmailAndCartId(String emailID, Long cartId);


}
