package org.example.ecommerce.service;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.net.RequestOptions;
import com.stripe.param.PaymentIntentCreateParams;
import org.example.ecommerce.exceptions.APIException;
import org.example.ecommerce.payload.StripePaymentDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeServiceImpl implements StripeService {

    private static final Logger logger = LoggerFactory.getLogger(StripeServiceImpl.class);

    @Value("${stripe.secret.key:}")
    private String secretKey;

    @Value("${stripe.currency:inr}")
    private String currency;

    @Override
    public StripePaymentDTO createPaymentIntent(String email, Double cartTotal) {
        long amount = toMinorUnits(cartTotal);
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency(currency)
                // Card-style methods only: the checkout confirms in place and never leaves the page.
                .setAutomaticPaymentMethods(PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .setAllowRedirects(PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER)
                        .build())
                .setReceiptEmail(email)
                // Lets verifyPaymentIntent check that this payment belongs to the user placing the order.
                .putMetadata("email", email)
                .build();
        try {
            PaymentIntent intent = PaymentIntent.create(params, requestOptions());
            return new StripePaymentDTO(intent.getClientSecret(), intent.getId(), amount, currency);
        } catch (StripeException e) {
            logger.error("Stripe PaymentIntent creation failed: {}", e.getMessage());
            throw new APIException("Could not start the card payment: " + e.getMessage());
        }
    }

    /**
     * The client only tells us which PaymentIntent it paid; we ask Stripe directly whether it
     * actually succeeded, for the right amount, for this user. A client-reported "SUCCESS" is never trusted.
     */
    @Override
    public void verifyPaymentIntent(String paymentIntentId, String email, Double cartTotal) {
        if (paymentIntentId == null || paymentIntentId.isBlank()) {
            throw new APIException("Missing Stripe payment id");
        }
        PaymentIntent intent;
        try {
            intent = PaymentIntent.retrieve(paymentIntentId, requestOptions());
        } catch (StripeException e) {
            logger.error("Stripe PaymentIntent lookup failed: {}", e.getMessage());
            throw new APIException("Could not verify the card payment");
        }
        if (!"succeeded".equals(intent.getStatus())) {
            throw new APIException("Card payment has not succeeded (status: " + intent.getStatus() + ")");
        }
        if (!email.equals(intent.getMetadata().get("email"))) {
            throw new APIException("This payment does not belong to the current user");
        }
        if (intent.getAmount() != toMinorUnits(cartTotal) || !currency.equalsIgnoreCase(intent.getCurrency())) {
            throw new APIException("Paid amount does not match the cart total");
        }
    }

    @Override
    public long toMinorUnits(Double amount) {
        return Math.round(amount * 100);
    }

    private RequestOptions requestOptions() {
        if (secretKey == null || secretKey.isBlank()) {
            throw new APIException("Card payments are not configured on the server (STRIPE_SECRET_KEY is missing)");
        }
        return RequestOptions.builder().setApiKey(secretKey).build();
    }
}
