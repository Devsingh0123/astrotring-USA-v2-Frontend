import apiClient from "@/lib/api-client";
import { normalizeCurrency } from "@/lib/utils";

/**
 * Fetch packages & coupons catalog from backend (strictly INR or USD)
 * @param {string} currency - "INR" | "USD"
 */
export const fetchBillingCatalog = async (currency = "INR") => {
  const safeCurrency = normalizeCurrency(currency);
  const response = await apiClient.get(`/billing/packs?currency=${safeCurrency}`);
  return response.data;
};

/**
 * Validate a promo coupon and preview GST breakdown
 */
export const validateCoupon = async ({ packId, couponCode, currency = "INR", billingState }) => {
  const safeCurrency = normalizeCurrency(currency);
  const safeState = billingState || (safeCurrency === "USD" ? "International" : "Delhi");
  const response = await apiClient.post("/billing/validate-coupon", {
    packId,
    couponCode,
    currency: safeCurrency,
    billingState: safeState,
  });
  return response.data;
};

/**
 * Create a real Razorpay Order on the backend (strictly INR or USD)
 * Returns { orderId, keyId, amount, amountSubunits, currency, ... }
 */
export const createRazorpayOrder = async ({
  packId,
  itemType = "questions",
  currency = "INR",
  couponCode = "",
  billingState,
}) => {
  const safeCurrency = normalizeCurrency(currency);
  const safeState = billingState || (safeCurrency === "USD" ? "International" : "Delhi");
  const response = await apiClient.post("/billing/create-order", {
    packId,
    itemType,
    currency: safeCurrency,
    couponCode,
    billingState: safeState,
  });
  return response.data;
};

/**
 * Verify Razorpay payment signature and fulfill user credits
 */
export const verifyRazorpayPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  method = "standard",
}) => {
  const response = await apiClient.post("/billing/verify-payment", {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    method,
  });
  return response.data;
};

/**
 * Log payment cancellation or failure
 */
export const recordPaymentFailure = async ({ razorpay_order_id, status = "cancelled", reason = "" }) => {
  try {
    const response = await apiClient.post("/billing/payment-failed", {
      razorpay_order_id,
      status,
      reason,
    });
    return response.data;
  } catch (err) {
    // Non-blocking telemetry
    console.warn("Failed to record payment telemetry:", err);
  }
};

/**
 * Fetch all user GST invoices
 */
export const fetchUserInvoices = async () => {
  const response = await apiClient.get("/billing/invoices");
  return response.data;
};
