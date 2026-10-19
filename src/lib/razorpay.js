/**
 * Razorpay Standard Checkout SDK Integration
 * Docs: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/
 */

export const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * Loads Razorpay checkout.js script if not already available on window
 * @returns {Promise<boolean>}
 */
export const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Backwards-compatible alias
export const loadRazorpayScript = loadRazorpay;

/**
 * Opens the official Razorpay Standard Checkout modal
 *
 * @param {Object} options
 * @param {string} options.keyId - Razorpay Public Key ID (defaults to VITE_RAZORPAY_KEY_ID)
 * @param {string} options.orderId - Backend-generated Razorpay order ID
 * @param {number} [options.amountSubunits] - Amount in subunits (e.g. 79900 for ₹799)
 * @param {number} [options.amount] - Amount in standard currency units (e.g. 799)
 * @param {string} [options.currency="INR"] - ISO currency code
 * @param {string} [options.name="AstroTring"] - Merchant business name
 * @param {string} [options.description] - Product or pack description
 * @param {string} [options.image="/logo-192.jpg"] - Brand logo URL
 * @param {Object} [options.user] - Prefill user info { name, email, phone }
 * @param {string} [options.themeColor="#9a4578"] - Hex color for checkout modal
 * @param {Function} options.onSuccess - Callback ({ razorpay_payment_id, razorpay_order_id, razorpay_signature }) => void
 * @param {Function} [options.onFailure] - Callback (error) => void
 * @param {Function} [options.onDismiss] - Callback () => void
 */
export const openRazorpayCheckout = async ({
  keyId,
  orderId,
  amountSubunits,
  amount,
  currency = "INR",
  name = "AstroTring",
  description = "AstroTring Consultation",
  image = "/logo-192.jpg",
  user = {},
  themeColor = "#9a4578",
  onSuccess,
  onFailure,
  onDismiss,
}) => {
  const isLoaded = await loadRazorpay();

  if (!isLoaded || !window.Razorpay) {
    const error = new Error("Unable to load Razorpay checkout SDK. Please check your connection.");
    onFailure?.(error);
    return;
  }

  const activeKey = keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!activeKey) {
    const error = new Error("Razorpay Key ID is required to initialize payment.");
    onFailure?.(error);
    return;
  }

  // Razorpay expects amount in smallest currency subunit (paise/cents)
  const finalSubunits = amountSubunits || Math.round(Number(amount || 0) * 100);

  const options = {
    key: activeKey,
    amount: finalSubunits,
    currency,
    name,
    description,
    image,
    order_id: orderId,
    prefill: {
      name: user?.name || "",
      email: user?.email || "",
      contact: user?.phone || "",
    },
    theme: {
      color: themeColor,
    },
    modal: {
      ondismiss: () => {
        onDismiss?.();
      },
    },
    handler: (response) => {
      onSuccess?.(response);
    },
  };

  try {
    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", (errorResponse) => {
      onFailure?.(errorResponse.error);
    });

    rzp.open();
  } catch (err) {
    onFailure?.(err);
  }
};
