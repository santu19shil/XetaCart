// Supabase Storage helper for product image uploads.
// Replaces local disk (multer) storage so files persist on serverless (Vercel).
const supabase = require('./db');

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';
const STORAGE_PUBLIC_URL_BASE = process.env.SUPABASE_URL
  ? `${process.env.SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public`
  : 'https://placeholder.supabase.co/storage/v1/object/public';

// Ensure the storage bucket exists (idempotent).
async function ensureBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = (buckets || []).some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, { public: true });
      if (error) {
        console.error('Error creating storage bucket:', error.message);
      }
    }
  } catch (error) {
    console.error('ensureBucket error:', error.message);
  }
}

// Upload a buffer/stream to Supabase Storage.
// Returns the public URL on success, or null on failure.
async function uploadImage(buffer, originalName) {
  const ext = (originalName.split('.').pop() || 'png').toLowerCase();
  const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const safeExt = allowed.includes(ext) ? ext : 'png';
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${safeExt}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, buffer, {
      contentType: `image/${safeExt === 'jpg' ? 'jpeg' : safeExt}`,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading image:', error.message);
    return null;
  }

  return `${STORAGE_PUBLIC_URL_BASE}/${BUCKET_NAME}/${fileName}`;
}

module.exports = { uploadImage, ensureBucket, BUCKET_NAME };
