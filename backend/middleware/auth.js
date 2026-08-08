const jwt = require('jsonwebtoken');
const supabase = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'xetacart_secret_key';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
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

module.exports = { authMiddleware, sellerOnly };
