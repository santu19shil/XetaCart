const express = require('express');
const { WHATSAPP_NUMBER, SELLER_NAME, STORE_ADDRESS, STORE_MAPS_URL, STORE_LAT, STORE_LNG, DELIVERY_RADIUS_KM, DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD, PAYMENT_NOTE } = require('../config/seller');

const router = express.Router();

// Public config endpoint used by the frontend to know the seller's WhatsApp number
// and other store details for the WhatsApp order flow.
router.get('/', (req, res) => {
  res.json({
    sellerName: SELLER_NAME,
    whatsappNumber: WHATSAPP_NUMBER,
storeAddress: STORE_ADDRESS,
    storeMapsUrl: STORE_MAPS_URL,
    storeLat: STORE_LAT,
    storeLng: STORE_LNG,
deliveryRadiusKm: DELIVERY_RADIUS_KM,
    deliveryCharge: DELIVERY_CHARGE,
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    paymentNote: PAYMENT_NOTE,
  });
});

module.exports = router;
