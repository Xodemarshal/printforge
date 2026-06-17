import Razorpay from "razorpay";

// Initialize Razorpay instance (server-side only)
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Helper to create an order
export async function createRazorpayOrder(amount: number, currency: string = "INR") {
  const options = {
    amount: Math.round(amount * 100), // amount in paise
    currency,
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return { success: true, order };
  } catch (error: any) {
    console.error("Razorpay order creation failed:", error);
    return { success: false, error: error.message };
  }
}

// Helper to verify payment signature
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const crypto = require("crypto");
  const text = `${orderId}|${paymentId}`;
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(text)
    .digest("hex");

  return generated_signature === signature;
}
