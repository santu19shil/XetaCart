const jwt = require('jsonwebtoken');
const supabase = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set and at least 32 characters');
}

const REFRESH_SECRET = process.env.REFRESH_SECRET;
if (!REFRESH_SECRET || REFRESH_SECRET.length < 32) {
  throw new Error('REFRESH_SECRET must be set and at least 32 characters');
}

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken
      || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, phone')
      .eq('id', decoded.userId)
      .maybeSingle();

    if (error || !data) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = data;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const sellerOnly = (req, res, next) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Access denied. Sellers only.' });
  }
  next();
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth/refresh',
  });
};

const clearAuthCookies = (res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('accessToken', { path: '/', httpOnly: true, secure: isProd, sameSite: 'strict' });
  res.clearCookie('refreshToken', { path: '/api/auth/refresh', httpOnly: true, secure: isProd, sameSite: 'strict' });
};

module.exports = { authMiddleware, sellerOnly, setAuthCookies, clearAuthCookies, JWT_SECRET, REFRESH_SECRET };