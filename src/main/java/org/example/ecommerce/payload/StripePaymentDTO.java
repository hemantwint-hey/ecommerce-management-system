package org.example.ecommerce.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StripePaymentDTO {
    private String clientSecret;
    private String paymentIntentId;
    // Smallest currency unit (paise for INR), exactly what Stripe will charge.
    private Long amount;
    private String currency;
}
