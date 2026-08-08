// Predefined single seller configuration.
// All values are read from environment variables. In production these MUST be
// set (in the Vercel dashboard / .env). The email/password are used to
// auto-create the seller account on first startup.

// In production, require SELLER_PASSWORD to be explicitly set (no insecure default).
const SELLER_PASSWORD = process.env.SELLER_PASSWORD
  || (process.env.NODE_ENV === 'production'
      ? (() => { throw new Error('SELLER_PASSWORD must be set in production'); })()
      : 'Santu@321'); // local dev fallback only

module.exports = {
  SELLER_EMAIL: process.env.SELLER_EMAIL || 'santushils16@gmail.com',
  SELLER_PASSWORD,
  SELLER_NAME: process.env.SELLER_NAME || 'XetaCart Store',
  SELLER_PHONE: process.env.SELLER_PHONE || '6033571851',
  // WhatsApp number in international format WITHOUT '+' - used for wa.me links
  WHATSAPP_NUMBER: process.env.SELLER_WHATSAPP || '916033571851',
  // Store details for delivery/pickup logic
  STORE_ADDRESS: process.env.STORE_ADDRESS || 'Jalefa Bazar, Sabroom, South Tripura, 799145',
  STORE_MAPS_URL: process.env.STORE_MAPS_URL || 'https://maps.app.goo.gl/ot4F6KvMi8ZVJi8c6',
  STORE_LAT: parseFloat(process.env.STORE_LAT || '23.1640'),
  STORE_LNG: parseFloat(process.env.STORE_LNG || '91.7380'),
  DELIVERY_RADIUS_KM: parseFloat(process.env.DELIVERY_RADIUS_KM || '3'),
  DELIVERY_CHARGE: parseFloat(process.env.DELIVERY_CHARGE || '30'),
  // Orders above this amount get FREE delivery (0 = never free)
  FREE_DELIVERY_THRESHOLD: parseFloat(process.env.FREE_DELIVERY_THRESHOLD || '500'),
  // Payment method note shown to customers (QR shared by seller via WhatsApp)
  PAYMENT_NOTE: process.env.PAYMENT_NOTE || 'Pay after your order is confirmed. The seller will share a QR code via WhatsApp for payment.',
};
