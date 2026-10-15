const jwt = require('jsonwebtoken');
const supabase = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const hasAuthConfiguration = Boolean(
  JWT_SECRET && JWT_SECRET.length >= 32 && REFRESH_SECRET && REFRESH_SECRET.length >= 32,
);

const authMiddleware = async (req, res, next) => {
  if (!hasAuthConfiguration) {
    return res.status(503).json({
      code: 'AUTH_CONFIGURATION_REQUIRED',
      message: 'Authentication is unavailable until JWT_SECRET and REFRESH_SECRET are configured with at least 32 characters each.',
    });
  }

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
  const sameSite = isProd ? 'strict' : 'lax';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite,
    maxAge: 15 * 60 * 1000,
    path: '/',
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth/refresh',
  });
};

const clearAuthCookies = (res) => {
  const isProd = process.env.NODE_ENV === 'production';
  const sameSite = isProd ? 'strict' : 'lax';
  res.clearCookie('accessToken', { path: '/', httpOnly: true, secure: isProd, sameSite });
  res.clearCookie('refreshToken', { path: '/api/auth/refresh', httpOnly: true, secure: isProd, sameSite });
};

module.exports = { authMiddleware, sellerOnly, setAuthCookies, clearAuthCookies, JWT_SECRET, REFRESH_SECRET, hasAuthConfiguration };
