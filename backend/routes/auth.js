const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/db');
const { authMiddleware, setAuthCookies, clearAuthCookies, JWT_SECRET, REFRESH_SECRET } = require('../middleware/auth');
const { SELLER_EMAIL, SELLER_PASSWORD, SELLER_NAME, SELLER_PHONE } = require('../config/seller');
const { handleError } = require('../utils/errors');

const router = express.Router();

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId, type: 'refresh' }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 12 }).withMessage('Password must be at least 12 characters')
    .matches(/[A-Z]/).withMessage('Password must contain uppercase')
    .matches(/[a-z]/).withMessage('Password must contain lowercase')
    .matches(/[0-9]/).withMessage('Password must contain number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain special character'),
  body('phone').matches(/^[\d\s\-\+]{10,}$/).withMessage('Valid phone required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    if (lowerEmail === String(SELLER_EMAIL).toLowerCase().trim()) {
      return res.status(400).json({ message: 'This email is reserved for the store account' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const { data, error } = await supabase
      .from('users')
      .insert({
        name: name.trim(),
        email: lowerEmail,
        password_hash: hashedPassword,
        role: 'customer',
        phone: phone.trim(),
      })
      .select('id, name, email, role, phone')
      .single();

    if (error) {
      if (error.code === '23505' || error.message?.toLowerCase().includes('duplicate')) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      return handleError(error, res);
    }

    const { accessToken, refreshToken } = generateTokens(data.id);
    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({ user: data });
  } catch (error) {
    handleError(error, res);
  }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    // Check if this is the seller email
    if (lowerEmail === String(SELLER_EMAIL).toLowerCase().trim()) {
      const { data: seller, error } = await supabase
        .from('users')
        .select('id, name, email, role, phone, password_hash')
        .eq('email', lowerEmail)
        .maybeSingle();

      if (error) {
        return handleError(error, res);
      }

      // If seller exists but role is not seller, update it
      if (seller && seller.role !== 'seller') {
        await supabase.from('users').update({ role: 'seller' }).eq('id', seller.id);
      }

      // If seller doesn't exist, create it
      if (!seller) {
        const hashedPassword = await bcrypt.hash(SELLER_PASSWORD, 12);
        const { data: createdSeller, error: createError } = await supabase
          .from('users')
          .insert({
            name: SELLER_NAME,
            email: lowerEmail,
            password_hash: hashedPassword,
            role: 'seller',
            phone: SELLER_PHONE,
          })
          .select('id, name, email, role, phone')
          .single();

        if (createError) {
          return handleError(createError, res);
        }

        const { accessToken, refreshToken } = generateTokens(createdSeller.id);
        setAuthCookies(res, accessToken, refreshToken);
        return res.json({ user: createdSeller });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, seller.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const safeSeller = {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        role: 'seller',
        phone: seller.phone,
      };
      const { accessToken, refreshToken } = generateTokens(seller.id);
      setAuthCookies(res, accessToken, refreshToken);
      return res.json({ user: safeSeller });
    }

    // Regular user login
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', lowerEmail)
      .maybeSingle();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (error) {
    handleError(error, res);
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, phone')
      .eq('id', decoded.userId)
      .maybeSingle();

    if (error || !data) {
      clearAuthCookies(res);
      return res.status(401).json({ message: 'User not found' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(data.id);
    setAuthCookies(res, accessToken, newRefreshToken);
    res.json({ user: data });
  } catch (error) {
    clearAuthCookies(res);
    res.status(401).json({ message: 'Session expired, please login' });
  }
});

router.post('/logout', (req, res) => {
  clearAuthCookies(res);
  res.json({ message: 'Logged out successfully' });
});

router.put('/profile', authMiddleware, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim().matches(/^[\d\s\-\+]{10,}$/).withMessage('Valid phone required'),
  body('password').optional().isLength({ min: 12 }).withMessage('Password must be at least 12 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, password } = req.body;
    const updates = { updated_at: new Date().toISOString() };

    if (name !== undefined) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (password) updates.password_hash = await bcrypt.hash(password, 12);

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, name, email, role, phone')
      .single();

    if (error) {
      return handleError(error, res);
    }

    res.json({ message: 'Profile updated successfully', user: data });
  } catch (error) {
    handleError(error, res);
  }
});

module.exports = router;