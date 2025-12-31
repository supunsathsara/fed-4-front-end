import { useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useAuth } from "@clerk/clerk-react";

// Initialize Stripe ONCE, outside component
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * CheckoutForm Component
 * 
 * Renders the Stripe Embedded Checkout for an invoice.
 * Uses the Stripe.js library to securely handle payment.
 */
export default function CheckoutForm({ invoiceId }) {
  const { getToken } = useAuth();

  // Stripe calls this to get the client secret
  const fetchClientSecret = useCallback(async () => {
    const token = await getToken();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

    const response = await fetch(
      `${baseUrl}/payments/create-checkout-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invoiceId }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create payment session");
    }

    const data = await response.json();
    return data.clientSecret;
  }, [invoiceId, getToken]);

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider 
        stripe={stripePromise} 
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
