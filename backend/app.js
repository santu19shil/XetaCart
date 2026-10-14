// Reusable Express application that can be served:
//  - Locally via server.js (Node)
//  - As a Vercel serverless function (api/index.js)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const supabase = require('./config/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const uploadRoutes = require('./routes/upload');
const configRoutes = require('./routes/config');
const orderRoutes = require('./routes/orders');
const adRoutes = require('./routes/ads');
const reviewRoutes = require('./routes/reviews');
const { SELLER_EMAIL, SELLER_PASSWORD, SELLER_NAME, SELLER_PHONE } = require('./config/seller');

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://*.supabase.co'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/config', configRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'XetaCart API is running' });
});

const ensureSeller = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', SELLER_EMAIL)
      .maybeSingle();

    if (error) {
      console.error('Error checking seller account:', error.message);
      return;
    }

    if (!data) {
      const hashedPassword = await bcrypt.hash(SELLER_PASSWORD, 12);
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