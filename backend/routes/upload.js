const express = require('express');
const multer = require('multer');
const { authMiddleware, sellerOnly } = require('../middleware/auth');
const { uploadImage, ensureBucket } = require('../config/storage');

const router = express.Router();

// Use memory storage so uploads work on serverless (Vercel) — no disk writes.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test((file.originalname || '').toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  },
});

// Ensure the storage bucket exists (idempotent).
router.use(async (req, res, next) => {
  await ensureBucket();
  next();
});

// Upload a product image to Supabase Storage.
router.post('/', authMiddleware, sellerOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const url = await uploadImage(req.file.buffer, req.file.originalname || 'image.png');
    if (!url) {
      return res.status(500).json({ message: 'Failed to upload image' });
    }
    res.json({ url });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

module.exports = router;
