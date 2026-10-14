const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { recalculateProductRating } = require('../utils/ratings');

const router = express.Router();

// Public: list all reviews for a product.
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const { data, error } = await supabase
      .from('reviews')
      .select('*, users(name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const reviews = (data || []).map((r) => ({
      ...r,
      reviewer_name: r.users?.name || 'Customer',
      users: undefined,
    }));

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Auth: check whether the current user is allowed to review this product.
// A review is only allowed after the customer has actually ordered the product.
router.get('/product/:productId/can-review', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    let canReview = false;
    let ordered = false;

    if (req.user.role === 'customer') {
      const { data: orderItem, error: orderItemError } = await supabase
        .from('order_items')
        .select('id, orders!inner(user_id)')
        .eq('product_id', productId)
        .eq('orders.user_id', userId)
        .limit(1)
        .maybeSingle();

      if (orderItemError && !/contains no rows/i.test(orderItemError.message || '')) {
        console.error('Review eligibility check error:', orderItemError.message);
      }

      ordered = !!orderItem;
      canReview = ordered;
    }

    const { data: existing, error: existingError } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingError && !/contains no rows/i.test(existingError.message || '')) {
      console.error('Review lookup error:', existingError.message);
    }

    res.json({
      canReview,
      ordered,
      hasReviewed: !!existing,
      review: existing || null,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Auth: submit (or update) a review for an ordered product.
router.post('/product/:productId', authMiddleware, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().isLength({ max: 1000 }).withMessage('Review must be under 1000 characters'),
], async (req, res) => {
  try {
    // Only customers can review products.
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can write reviews.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId } = req.params;
    const { rating, comment = '' } = req.body;
    const userId = req.user.id;

    // Verify the user actually ordered this product before allowing a review.
    const { data: orderItem, error: orderItemError } = await supabase
      .from('order_items')
      .select('id, orders!inner(user_id)')
      .eq('product_id', productId)
      .eq('orders.user_id', userId)
      .limit(1)
      .maybeSingle();

    if (orderItemError && !/contains no rows/i.test(orderItemError.message || '')) {
      return res.status(500).json({ message: orderItemError.message });
    }

    if (!orderItem) {
      return res.status(403).json({
        message: 'You can only review a product after ordering it.',
      });
    }

    // Insert or update the user's existing review for this product.
    const { data: existing, error: existingError } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingError && !/contains no rows/i.test(existingError.message || '')) {
      return res.status(500).json({ message: existingError.message });
    }

    let review;
    if (existing) {
      const { data, error } = await supabase
        .from('reviews')
        .update({ rating, comment, created_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select('*, users(name)')
        .single();
      if (error) return res.status(400).json({ message: error.message });
      review = data;
    } else {
      const { data, error } = await supabase
        .from('reviews')
        .insert({ product_id: productId, user_id: userId, rating, comment })
        .select('*, users(name)')
        .single();
      if (error) return res.status(400).json({ message: error.message });
      review = data;
    }

    // Recompute product rating / review count.
    await recalculateProductRating(productId);

    res.status(201).json({
      message: existing ? 'Your review has been updated.' : 'Thank you for your review!',
      review: { ...review, reviewer_name: review.users?.name || 'Customer', users: undefined },
    });
  } catch (error) {
    console.error('Review submission error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;