// Predefined single seller configuration.
// All values are read from environment variables. In production these MUST be
// set (in the Vercel dashboard / .env). The email/password are used to
// auto-create the seller account on first startup.

const SELLER_PASSWORD = process.env.SELLER_PASSWORD;

module.exports = {
  SELLER_EMAIL: process.env.SELLER_EMAIL,
  SELLER_PASSWORD,
  SELLER_NAME: process.env.SELLER_NAME || 'XetaCart Store',
  SELLER_PHONE: process.env.SELLER_PHONE,
  // WhatsApp number in international format WITHOUT '+' - used for wa.me links
  WHATSAPP_NUMBER: process.env.SELLER_WHATSAPP,
  // Store details for delivery/pickup logic
  STORE_ADDRESS: process.env.STORE_ADDRESS,
  STORE_MAPS_URL: process.env.STORE_MAPS_URL,
  STORE_LAT: parseFloat(process.env.STORE_LAT || '0'),
  STORE_LNG: parseFloat(process.env.STORE_LNG || '0'),
  DELIVERY_RADIUS_KM: parseFloat(process.env.DELIVERY_RADIUS_KM || '3'),
  DELIVERY_CHARGE: parseFloat(process.env.DELIVERY_CHARGE || '30'),
  // Orders above this amount get FREE delivery (0 = never free)
  FREE_DELIVERY_THRESHOLD: parseFloat(process.env.FREE_DELIVERY_THRESHOLD || '500'),
  // Payment method note shown to customers (QR shared by seller via WhatsApp)
  PAYMENT_NOTE: process.env.PAYMENT_NOTE || 'Pay after your order is confirmed. The seller will share a QR code via WhatsApp for payment.',
};
