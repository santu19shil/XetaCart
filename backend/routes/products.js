const express = require('express');
const { body, validationResult, query } = require('express-validator');
const supabase = require('../config/db');
const { authMiddleware, sellerOnly } = require('../middleware/auth');
const { handleError } = require('../utils/errors');

const router = express.Router();

const sanitizeSearch = (input) => {
  if (!input) return '';
  return String(input).replace(/[%_]/g, '\\$&').trim();
};

const sanitizeText = (input, maxLen = 500) => {
  if (!input) return '';
  return String(input).trim().slice(0, maxLen);
};

router.get('/', [
  query('category').optional().isString().trim(),
  query('search').optional().isString().trim(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('brand').optional().isString().trim(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isIn(['price_asc', 'price_desc', 'newest', 'popularity'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category, search, minPrice, maxPrice, brand, limit, sort } = req.query;

    let query = supabase
      .from('products')
      .select('*, users(name)');

    if (category) {
      query = query.ilike('category', `%${sanitizeSearch(category)}%`);
    }
    if (search) {
      const safeSearch = sanitizeSearch(search);
      query = query.or(`name.ilike.%${safeSearch}%,brand.ilike.%${safeSearch}%`);
    }
    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }
    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }
    if (brand) {
      query = query.ilike('brand', `%${sanitizeSearch(brand)}%`);
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
      console.error('Products fetch error:', error.message);
      return handleError(error, res);
    }

    const products = (data || []).map((p) => ({
      ...p,
      seller_name: p.users?.name || null,
      users: undefined,
    }));

    res.json(products);
  } catch (error) {
    handleError(error, res);
  }
});

router.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category');

    if (error) {
      return handleError(error, res);
    }

    const categories = [...new Set((data || []).map((r) => r.category))].sort();
    res.json(categories);
  } catch (error) {
    handleError(error, res);
  }
});

router.get('/brands', [
  query('category').optional().isString().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category } = req.query;
    let query = supabase
      .from('products')
      .select('brand')
      .neq('brand', '')
      .not('brand', 'is', null);

    if (category) {
      query = query.ilike('category', `%${sanitizeSearch(category)}%`);
    }

    const { data, error } = await query;
    if (error) {
      return handleError(error, res);
    }

    const brands = [...new Set((data || []).map((r) => r.brand).filter(Boolean))].sort();
    res.json(brands);
  } catch (error) {
    handleError(error, res);
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
      return handleError(error, res);
    }
    if (!data) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ ...data, seller_name: data.users?.name || null, users: undefined });
  } catch (error) {
    handleError(error, res);
  }
});

router.post('/', authMiddleware, sellerOnly, [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('mrp').isFloat({ min: 0 }).withMessage('Valid MRP is required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock is required'),
  body('description').optional().isString(),
  body('brand').optional().isString().trim(),
  body('image_url').optional().isString(),
  body('is_lightning').optional().isBoolean(),
  body('hot_percentage').optional().isInt({ min: 0, max: 100 }),
  body('free_delivery').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, category, brand, price, mrp, stock, image_url, is_lightning, hot_percentage, free_delivery } = req.body;
    const discount = Math.round(((mrp - price) / mrp) * 100);

    const { data: maxData, error: countError } = await supabase
      .from('products')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (countError) {
      return handleError(countError, res);
    }

    const lastId = maxData?.[0]?.id ?? 0;
    const nextNumber = Number(lastId) + 100001;
    const product_code = `XC-${nextNumber}`;

    const { data, error } = await supabase
      .from('products')
      .insert({
        seller_id: req.user.id,
        product_code,
        name: sanitizeText(name),
        description: sanitizeText(description || ''),
        category: sanitizeText(category),
        brand: sanitizeText(brand || ''),
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
      return handleError(error, res);
    }

    res.status(201).json(data);
  } catch (error) {
    handleError(error, res);
  }
});

router.put('/:id', authMiddleware, sellerOnly, [
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Valid price required'),
  body('mrp').optional().isFloat({ min: 0 }).withMessage('Valid MRP required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Valid stock required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description, category, brand, price, mrp, stock, image_url, is_lightning, free_delivery } = req.body;

    const { data: productCheck, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .eq('seller_id', req.user.id)
      .maybeSingle();

    if (checkError) {
      return handleError(checkError, res);
    }
    if (!productCheck) {
      return res.status(404).json({ message: 'Product not found or not authorized' });
    }

    const discount = Math.round(((mrp - price) / mrp) * 100);

    const { data, error } = await supabase
      .from('products')
      .update({
        name: name ? sanitizeText(name) : undefined,
        description: description !== undefined ? sanitizeText(description || '') : undefined,
        category: category ? sanitizeText(category) : undefined,
        brand: brand !== undefined ? sanitizeText(brand || '') : undefined,
        price,
        mrp,
        discount,
        stock,
        image_url: image_url || '',
        is_lightning: is_lightning || false,
        free_delivery: free_delivery || false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return handleError(error, res);
    }

    res.json(data);
  } catch (error) {
    handleError(error, res);
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
      return handleError(error, res);
    }
    if (!data) {
      return res.status(404).json({ message: 'Product not found or not authorized' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    handleError(error, res);
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
      return handleError(error, res);
    }

    res.json(data || []);
  } catch (error) {
    handleError(error, res);
  }
});

router.post('/:id/stock', authMiddleware, sellerOnly, [
  body('stock').isInt({ min: 0 }).withMessage('Valid stock quantity is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { stock } = req.body;

    const { data, error } = await supabase
      .from('products')
      .update({ stock })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return handleError(error, res);
    }

    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
});

module.exports = router;
