const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/db');
const { authMiddleware, sellerOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, brand, limit, sort } = req.query;

    let query = supabase
      .from('products')
      .select('*, users(name)')
      .gt('stock', 0);

    if (category) {
      query = query.ilike('category', `%${category}%`);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
    }
    if (minPrice) {
      query = query.gte('price', minPrice);
    }
    if (maxPrice) {
      query = query.lte('price', maxPrice);
    }
    if (brand) {
      query = query.ilike('brand', `%${brand}%`);
    }

    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'popularity':
        query = query.order('reviews', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const products = (data || []).map((p) => ({
      ...p,
      seller_name: p.users?.name || null,
      users: undefined,
    }));

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .gt('stock', 0);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const categories = [...new Set((data || []).map((r) => r.category))].sort();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/brands', async (req, res) => {
  try {
    const { category } = req.query;
    let query = supabase
      .from('products')
      .select('brand')
      .gt('stock', 0)
      .neq('brand', '')
      .not('brand', 'is', null);

    if (category) {
      query = query.ilike('category', `%${category}%`);
    }

    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const brands = [...new Set((data || []).map((r) => r.brand).filter(Boolean))].sort();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, users(name)')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ message: error.message });
    }
    if (!data) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ ...data, seller_name: data.users?.name || null, users: undefined });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authMiddleware, sellerOnly, [
  body('name').not().isEmpty().withMessage('Product name is required'),
  body('category').not().isEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('mrp').isFloat({ min: 0 }).withMessage('Valid MRP is required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

const { name, description, category, brand, price, mrp, stock, image_url, is_lightning, hot_percentage, free_delivery } = req.body;
    const discount = Math.round(((mrp - price) / mrp) * 100);

// Generate a unique product code (XC-100001, XC-100002, ...)
    // Use max(id) for a more reliable sequence than a row count.
    const { data: maxData, error: countError } = await supabase
      .from('products')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (countError) {
      return res.status(500).json({ message: countError.message });
    }

    const lastId = maxData?.[0]?.id ?? 0;
    const nextNumber = lastId + 100000 + 1;
    const product_code = `XC-${nextNumber}`;

    const { data, error } = await supabase
      .from('products')
      .insert({
        seller_id: req.user.id,
        product_code,
        name,
        description: description || '',
        category,
        brand: brand || '',
        price,
        mrp,
        discount,
        stock,
        image_url: image_url || '',
        is_lightning: is_lightning || false,
        hot_percentage: hot_percentage || 0,
        free_delivery: free_delivery || false,
      })
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

router.put('/:id', authMiddleware, sellerOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, brand, price, mrp, stock, image_url, is_lightning, hot_percentage, free_delivery } = req.body;

    const { data: productCheck, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .eq('seller_id', req.user.id)
      .maybeSingle();

    if (checkError) {
      return res.status(500).json({ message: checkError.message });
    }
    if (!productCheck) {
      return res.status(404).json({ message: 'Product not found or not authorized' });
    }

    const discount = Math.round(((mrp - price) / mrp) * 100);

    const { data, error } = await supabase
      .from('products')
      .update({
        name,
        description: description || '',
        category,
        brand: brand || '',
        price,
        mrp,
        discount,
        stock,
        image_url: image_url || '',
        is_lightning: is_lightning || false,
        hot_percentage: hot_percentage || 0,
        free_delivery: free_delivery || false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, sellerOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('seller_id', req.user.id)
      .select('id')
      .maybeSingle();

    if (error) {
      return res.status(500).json({ message: error.message });
    }
    if (!data) {
      return res.status(404).json({ message: 'Product not found or not authorized' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/seller/my-products', authMiddleware, sellerOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', req.user.id)
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
