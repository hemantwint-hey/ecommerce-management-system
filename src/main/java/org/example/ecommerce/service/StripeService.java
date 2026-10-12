package org.example.ecommerce.service;

import org.example.ecommerce.payload.StripePaymentDTO;

public interface StripeService {
    StripePaymentDTO createPaymentIntent(String email, Double cartTotal);

    void verifyPaymentIntent(String paymentIntentId, String email, Double cartTotal);

    long toMinorUnits(Double amount);
}
