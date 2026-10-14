const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Orders are still confirmed over WhatsApp, but we also store a record of every
// placed order so that (a) customers can only review items they actually
// ordered and (b) stock is updated consistently server-side.

router.post('/', authMiddleware, [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.product_id').isInt({ min: 1 }).withMessage('Invalid product in order'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Invalid quantity in order'),
  body('delivery_method').isIn(['delivery', 'pickup']).withMessage('Invalid delivery method'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, delivery_method, delivery_address = '', store_address = '' } = req.body;
    const userId = req.user.id;

    // Load the products once to verify stock and capture prices/names.
    const productIds = [...new Set(items.map((i) => i.product_id))];
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, price, stock, image_url')
      .in('id', productIds);

    if (productError) {
      return res.status(500).json({ message: productError.message });
    }

    const productMap = new Map((products || []).map((p) => [p.id, p]));

    let total = 0;
    const orderItems = [];
    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product_id} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      const lineTotal = Number(product.price) * item.quantity;
      total += lineTotal;
      orderItems.push({
        product_id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: item.quantity,
        image_url: product.image_url || '',
      });
    }

    // Store a JSON snapshot of the order inside the orders row.
    const itemsSnapshot = orderItems.map(({ product_id, name, price, quantity, image_url }) => ({
      product_id,
      name,
      price,
      quantity,
      image_url,
    }));

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        customer_name: req.user.name,
        customer_phone: req.user.phone,
        delivery_method,
        delivery_address,
        store_address,
        items: itemsSnapshot,
        total,
        status: 'placed',
      })
      .select()
      .single();

    if (orderError) {
      return res.status(400).json({ message: orderError.message });
    }

    // Insert order_items rows (used for review eligibility checks).
    const { error: itemsError } = await supabase.from('order_items').insert(
      orderItems.map((oi) => ({
        order_id: order.id,
        product_id: oi.product_id,
        quantity: oi.quantity,
        price: oi.price,
      }))
    );

    if (itemsError) {
      console.error('Failed to save order_items:', itemsError.message);
    }

    // Decrement stock for each ordered product.
    for (const item of orderItems) {
      const product = productMap.get(item.product_id);
      const newStock = Math.max(0, product.stock - item.quantity);
      await supabase
        .from('products')
        .update({ stock: newStock, updated_at: new Date().toISOString() })
        .eq('id', item.product_id);
    }

    res.status(201).json({ message: 'Order recorded successfully', order });
  } catch (error) {
    console.error('Order creation error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// List the authenticated customer's orders (most recent first).
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json(data || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;