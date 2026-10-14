const express = require('express');
const multer = require('multer');
const { authMiddleware, sellerOnly } = require('../middleware/auth');
const { uploadImage, ensureBucket } = require('../config/storage');

const router = express.Router();

// Use memory storage so uploads work on serverless (Vercel) — no disk writes.
const allowedImageTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extension = require('path').extname(file.originalname || '').toLowerCase();
    if (allowedImageTypes[extension] === file.mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'));
  },
});

const hasValidImageSignature = (buffer, mimeType) => {
  if (mimeType === 'image/jpeg') return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === 'image/gif') return ['GIF87a', 'GIF89a'].includes(buffer.toString('ascii', 0, 6));
  if (mimeType === 'image/webp') return buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  return false;
};

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

    if (!hasValidImageSignature(req.file.buffer, req.file.mimetype)) {
      return res.status(400).json({ message: 'Uploaded file content is not a valid image' });
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
