const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const cart = (data || []).map((ci) => ({
      cart_item_id: ci.id,
      quantity: ci.quantity,
      product_id: ci.product_id,
      ...ci.products,
    }));

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', [
  body('product_id').isInt().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { product_id, quantity } = req.body;

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('stock')
      .eq('id', product_id)
      .maybeSingle();

    if (productError) {
      return res.status(500).json({ message: productError.message });
    }
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const { data: existing, error: existingError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', req.user.id)
      .eq('product_id', product_id)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ message: existingError.message });
    }

    if (existing) {
      const newQty = existing.quantity + quantity;
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: newQty })
        .eq('id', existing.id);

      if (updateError) {
        return res.status(500).json({ message: updateError.message });
      }
      return res.json({ message: 'Cart updated', cart_item_id: existing.id });
    }

    const { data, error } = await supabase
      .from('cart_items')
      .insert({ user_id: req.user.id, product_id, quantity })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:itemId', [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const { data: cartItem, error: cartError } = await supabase
      .from('cart_items')
      .select('product_id')
      .eq('id', itemId)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (cartError) {
      return res.status(500).json({ message: cartError.message });
    }
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    const { data: product } = await supabase
      .from('products')
      .select('stock')
      .eq('id', cartItem.product_id)
      .maybeSingle();

    if (product && product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({ message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:itemId', async (req, res) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', req.params.itemId)
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
