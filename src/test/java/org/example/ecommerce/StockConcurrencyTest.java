package org.example.ecommerce;

import org.example.ecommerce.model.Category;
import org.example.ecommerce.model.Product;
import org.example.ecommerce.repositories.CategoryRepository;
import org.example.ecommerce.repositories.ProductRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Two buyers try to take the last unit at the same moment. Exactly one must succeed and stock must end at 0, not -1.
 * Uses the configured MySQL database; it creates its own category/product and deletes them afterwards.
 */
@SpringBootTest
class StockConcurrencyTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PlatformTransactionManager transactionManager;

    private Category category;
    private Product product;

    @BeforeEach
    void createProductWithOneUnit() {
        category = new Category();
        category.setCategoryName("Concurrency test " + UUID.randomUUID());
        category = categoryRepository.save(category);

        product = new Product();
        product.setProductName("Last unit " + UUID.randomUUID());
        product.setDescription("Only one left in stock");
        product.setPrice(100.0);
        product.setDiscount(0.0);
        product.setSpecialPrice(100.0);
        product.setQuantity(1);
        product.setCategory(category);
        product = productRepository.save(product);
    }

    @AfterEach
    void cleanUp() {
        productRepository.deleteById(product.getProductId());
        categoryRepository.deleteById(category.getCategoryId());
    }

    @Test
    void onlyOneOfTwoSimultaneousBuyersGetsTheLastUnit() throws Exception {
        TransactionTemplate tx = new TransactionTemplate(transactionManager);
        CountDownLatch startTogether = new CountDownLatch(1);
        ExecutorService buyers = Executors.newFixedThreadPool(2);

        Callable<Integer> buyOne = () -> {
            startTogether.await();
            return tx.execute(status -> {
                int updated = productRepository.decrementStock(product.getProductId(), 1);
                // Keep the transaction (and the row lock) open a little, like the rest of placeOrder would,
                // so the other buyer is forced to wait for this commit.
                sleep(300);
                return updated;
            });
        };

        List<Future<Integer>> results = List.of(buyers.submit(buyOne), buyers.submit(buyOne));
        startTogether.countDown();
        int buyerA = results.get(0).get(10, TimeUnit.SECONDS);
        int buyerB = results.get(1).get(10, TimeUnit.SECONDS);
        buyers.shutdown();

        assertThat(buyerA + buyerB).as("exactly one buyer reserves the unit").isEqualTo(1);
        assertThat(productRepository.findById(product.getProductId()).orElseThrow().getQuantity())
                .as("stock never goes negative")
                .isZero();
    }

    private static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
