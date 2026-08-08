const express = require('express');
const { WHATSAPP_NUMBER, SELLER_NAME } = require('../config/seller');

const router = express.Router();

// Public config endpoint used by the frontend to know the seller's WhatsApp number
// and other store details for the WhatsApp order flow.
router.get('/', (req, res) => {
  res.json({
    sellerName: SELLER_NAME,
    whatsappNumber: WHATSAPP_NUMBER,
    storeAddress: process.env.STORE_ADDRESS || 'Jalefa Bazar, Sabroom, South Tripura, 799145',
  });
});

module.exports = router;
