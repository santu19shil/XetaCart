const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/db');
const { authMiddleware, sellerOnly } = require('../middleware/auth');

const router = express.Router();

const isMissingAdsTable = (error) =>
  error?.code === 'PGRST205' ||
  /could not find the table ['"]?public\.advertisements['"]? in the schema cache/i.test(error?.message || '');

const sendAdsError = (res, error) => {
  if (isMissingAdsTable(error)) {
    return res.status(503).json({ message: 'Hero ads are not set up yet. Run ads-migration.sql in the Supabase SQL Editor and refresh the schema cache.' });
  }
  return res.status(500).json({ message: error.message || 'Ads request failed' });
};

// Public: list active advertisements for the hero banner.
// Optionally include the linked product so the frontend can deep-link to it.
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*, products(id, name, price)')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      // Ads are optional for the storefront; Home falls back to product slides.
      if (isMissingAdsTable(error)) return res.json([]);
      return sendAdsError(res, error);
    }

    const ads = (data || []).map((ad) => ({
      ...ad,
      product: ad.products || null,
      products: undefined,
    }));

    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Seller: list all ads (including inactive ones).
router.get('/all', authMiddleware, sellerOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*, products(id, name, price)')
      .eq('seller_id', req.user.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      return sendAdsError(res, error);
    }

    const ads = (data || []).map((ad) => ({
      ...ad,
      product: ad.products || null,
      products: undefined,
    }));

    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

const adValidators = [
  body('title').not().isEmpty().withMessage('Ad title is required'),
  body('image_url').optional().isString().withMessage('Invalid image URL'),
  body('subtitle').optional().isString().withMessage('Invalid subtitle'),
  body('product_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Invalid product link'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
  body('sort_order').optional().isInt({ min: 0 }).withMessage('Invalid sort order'),
];

// Seller: create an ad for the hero section.
router.post('/', authMiddleware, sellerOnly, adValidators, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, subtitle = '', image_url = '', product_id = null, is_active = true, sort_order = 0 } = req.body;

    const { data, error } = await supabase
      .from('advertisements')
      .insert({
        seller_id: req.user.id,
        title,
        subtitle,
        image_url,
        product_id,
        is_active,
        sort_order,
      })
      .select()
      .single();

    if (error) {
      if (isMissingAdsTable(error)) return sendAdsError(res, error);
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Seller: update an ad.
router.put('/:id', authMiddleware, sellerOnly, adValidators, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, subtitle, image_url, product_id, is_active, sort_order } = req.body;

    const { data: adCheck, error: checkError } = await supabase
      .from('advertisements')
      .select('id')
      .eq('id', id)
      .eq('seller_id', req.user.id)
      .maybeSingle();

    if (checkError) {
      return sendAdsError(res, checkError);
    }
    if (!adCheck) {
      return res.status(404).json({ message: 'Ad not found or not authorized' });
    }

    const updates = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (subtitle !== undefined) updates.subtitle = subtitle;
    if (image_url !== undefined) updates.image_url = image_url;
    if (product_id !== undefined) updates.product_id = product_id || null;
    if (is_active !== undefined) updates.is_active = is_active;
    if (sort_order !== undefined) updates.sort_order = sort_order;

    const { data, error } = await supabase
      .from('advertisements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (isMissingAdsTable(error)) return sendAdsError(res, error);
      return res.status(400).json({ message: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Seller: delete an ad.
router.delete('/:id', authMiddleware, sellerOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('advertisements')
      .delete()
      .eq('id', req.params.id)
      .eq('seller_id', req.user.id)
      .select('id')
      .maybeSingle();

    if (error) {
      return sendAdsError(res, error);
    }
    if (!data) {
      return res.status(404).json({ message: 'Ad not found or not authorized' });
    }

    res.json({ message: 'Ad deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
