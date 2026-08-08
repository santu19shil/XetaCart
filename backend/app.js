// Reusable Express application that can be served:
//  - Locally via server.js (Node)
//  - As a Vercel serverless function (api/index.js)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const supabase = require('./config/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const uploadRoutes = require('./routes/upload');
const configRoutes = require('./routes/config');
const { SELLER_EMAIL, SELLER_PASSWORD, SELLER_NAME, SELLER_PHONE } = require('./config/seller');

const app = express();

// Allow requests from any origin (the frontend is served from Vercel).
// In production you can restrict this to your Vercel domain.
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/config', configRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'XetaCart API is running' });
});

// Ensure the predefined seller account exists in Supabase on startup.
// For serverless, this runs on each cold start (idempotent; cheap because it just checks).
const ensureSeller = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', SELLER_EMAIL)
      .maybeSingle();

    if (error) {
      // Table may not exist yet — log but don't crash.
      console.error('Error checking seller account:', error.message);
      return;
    }

    if (!data) {
      const hashedPassword = await bcrypt.hash(SELLER_PASSWORD, 10);
      const { error: insertError } = await supabase.from('users').insert({
        name: SELLER_NAME,
        email: SELLER_EMAIL,
        password_hash: hashedPassword,
        role: 'seller',
        phone: SELLER_PHONE,
      });

      if (insertError) {
        console.error('Error creating seller account:', insertError.message);
      } else {
        console.log('Predefined seller account ensured.');
      }
    }
  } catch (error) {
    console.error('Seller setup error:', error.message);
  }
};

module.exports = app;
module.exports.ensureSeller = ensureSeller;
