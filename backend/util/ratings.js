const supabase = require('../config/db');

// Recompute the average rating and review count of a product from its reviews.
// Used after a review is created/updated/deleted.
async function recalculateProductRating(productId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId);

  if (error) {
    console.error('recalculateProductRating: query failed:', error.message);
    return null;
  }

  const ratings = (data || []).map((r) => Number(r.rating)).filter((n) => Number.isFinite(n));
  const count = ratings.length;
  const avg = count
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / count) * 10) / 10
    : 0;

  const { error: updateError } = await supabase
    .from('products')
    .update({ rating: avg, reviews: count, updated_at: new Date().toISOString() })
    .eq('id', productId);

  if (updateError) {
    console.error('recalculateProductRating: update failed:', updateError.message);
    return null;
  }

  return { rating: avg, reviews: count };
}

module.exports = { recalculateProductRating };