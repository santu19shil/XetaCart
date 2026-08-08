const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/db');
const { SELLER_EMAIL, SELLER_PASSWORD, SELLER_NAME, SELLER_PHONE } = require('../config/seller');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'xetacart_secret_key';

// Registration is restricted to BUYERS (customers) only.
// The single seller account is predefined and managed by the system.
router.post('/register', [
  body('name').not().isEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').not().isEmpty().withMessage('Phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;
    const lowerEmail = String(email).toLowerCase().trim();

    // Prevent registering with the predefined seller email
    if (lowerEmail === String(SELLER_EMAIL).toLowerCase().trim()) {
      return res.status(400).json({ message: 'This email is reserved for the store account' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert({
        name,
        email: lowerEmail,
        password_hash: hashedPassword,
        role: 'customer',
        phone,
      })
      .select('id, name, email, role, phone')
      .single();

    if (error) {
      if (error.code === '23505' || error.message?.toLowerCase().includes('duplicate')) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      return res.status(400).json({ message: error.message || 'Server error' });
    }

    const token = jwt.sign({ userId: data.id }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user: data });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').not().isEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const lowerEmail = String(email).toLowerCase().trim();

    // If the predefined seller credentials match, log in as the seller.
    if (lowerEmail === String(SELLER_EMAIL).toLowerCase().trim()) {
      const passwordMatches = password === SELLER_PASSWORD;
      if (!passwordMatches) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Ensure the seller account exists in the database
      const { data: seller, error } = await supabase
        .from('users')
        .select('id, name, email, role, phone')
        .eq('email', lowerEmail)
        .maybeSingle();

      if (error) {
        return res.status(500).json({ message: 'Server error' });
      }

      if (!seller) {
        const { data: createdSeller, error: createError } = await supabase
          .from('users')
          .insert({
            name: SELLER_NAME,
            email: lowerEmail,
            password_hash: await bcrypt.hash(SELLER_PASSWORD, 10),
            role: 'seller',
            phone: SELLER_PHONE,
          })
          .select('id, name, email, role, phone')
          .single();

        if (createError) {
          return res.status(500).json({ message: 'Server error creating seller account' });
        }

        const token = jwt.sign({ userId: createdSeller.id }, JWT_SECRET, { expiresIn: '30d' });
        return res.json({ token, user: createdSeller });
      }

      const token = jwt.sign({ userId: seller.id }, JWT_SECRET, { expiresIn: '30d' });
      return res.json({ token, user: seller });
    }

    // Normal buyer login
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', lowerEmail)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ message: 'Server error' });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
