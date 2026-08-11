// Razorpay adapter for the B2C checkout.
// IMPORTANT: order creation/signature verification must happen in Firebase Cloud Functions.
// Never place Razorpay secret/key-secret credentials in this repository.
export const RAZORPAY_CONFIG = Object.freeze({
  provider: 'razorpay',
  currency: 'INR',
  createOrderFunction: 'createRazorpayOrder',
  verifyPaymentFunction: 'verifyRazorpayPayment'
});

export async function createPaymentOrder(callable, payload) {
  if (typeof callable !== 'function') throw new Error('Payment service is unavailable.');
  return callable(payload);
}
