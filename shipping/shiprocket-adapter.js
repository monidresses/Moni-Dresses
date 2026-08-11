// Shiprocket adapter contract for B2C checkout/order tracking.
// Shiprocket credentials and API calls must remain server-side in Firebase Cloud Functions.
export const SHIPROCKET_CONFIG = Object.freeze({
  provider: 'shiprocket',
  createShipmentFunction: 'createShiprocketShipment',
  cancelShipmentFunction: 'cancelShiprocketShipment',
  trackingFunction: 'getShiprocketTracking'
});

export async function createShipment(callable, payload) {
  if (typeof callable !== 'function') throw new Error('Shipping service is unavailable.');
  return callable(payload);
}
