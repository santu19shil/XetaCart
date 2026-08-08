// Predefined single seller configuration.
// These values are read from environment variables with sensible defaults.
module.exports = {
  SELLER_EMAIL: process.env.SELLER_EMAIL || 'santushils16@gmail.com',
  SELLER_PASSWORD: process.env.SELLER_PASSWORD || 'Santu@321',
  SELLER_NAME: process.env.SELLER_NAME || 'XetaCart Store',
  SELLER_PHONE: process.env.SELLER_PHONE || '6033571851',
  // WhatsApp number in international format WITHOUT '+' - used for wa.me links
  WHATSAPP_NUMBER: process.env.SELLER_WHATSAPP || '916033571851',
};
