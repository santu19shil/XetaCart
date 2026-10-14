import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsAPI, reviewsAPI } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, ArrowLeft, Zap, Truck, Tag, Star, MessageSquare } from 'lucide-react';
import RatingStars from '../components/RatingStars';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadProduct = async () => {
    try {
      const response = await productsAPI.getById(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to fetch product', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await reviewsAPI.getByProduct(id);
      setReviews(response.data || []);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    }
  };

  const loadEligibility = async () => {
    if (!user) {
      setEligibility(null);
      return;
    }
    try {
      const response = await reviewsAPI.canReview(id);
      setEligibility(response.data || { canReview: false, hasReviewed: false, review: null });
      if (response.data?.review) {
        setMyRating(response.data.review.rating || 5);
        setMyComment(response.data.review.comment || '');
      }
    } catch (error) {
      console.error('Failed to check review eligibility', error);
    }
  };

  useEffect(() => {
    loadProduct();
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    loadEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const handleAddToCart = async () => {
    if (!user) {
      window.alert('Please log in or create an account before ordering.');
      navigate('/login');
      return;
    }
    await addToCart(product.id, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setReviewMsg('');
    try {
      const response = await reviewsAPI.submit(id, { rating: myRating, comment: myComment.trim() });
      setReviewMsg('✅ ' + (response.data.message || 'Review submitted'));
      await Promise.all([loadReviews(), loadProduct(), loadEligibility()]);
    } catch (error) {
      setReviewMsg('❌ ' + (error.response?.data?.message || 'Failed to submit review'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-400">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Product not found</p>
          <button onClick={() => navigate('/')} className="gradient-gold text-dark px-6 py-2 rounded-full font-bold">
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-5xl mx-auto px-4">
<button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm">
          <ArrowLeft size={18} /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="bg-gray-50 flex items-center justify-center p-8 min-h-[300px] md:min-h-[400px]">
              <img
                src={product.image_url || 'https://placehold.co/400x400/f0f4f8/999?text=No+Image'}
                alt={product.name}
                className="max-w-full max-h-[350px] md:max-h-[450px] object-contain"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/400x400/f0f4f8/999?text=Image';
                }}
              />
            </div>

            <div className="p-6 md:p-8 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-deal-red text-white text-xs font-bold px-2 py-1 rounded">{discount}% off</span>
                {product.is_lightning && (
                  <span className="gradient-gold text-dark text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <Zap size={12} /> Lightning Deal
                  </span>
                )}
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

              {product.product_code && (
                <p className="text-xs text-gray-400 font-medium mb-3">Product Code: {product.product_code}</p>
              )}

              {/* Rating summary */}
              <div className="flex items-center gap-2 mb-2">
                <RatingStars rating={product.rating || 0} size={16} showValue />
                <Link
                  to="#reviews"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs text-orange hover:underline font-medium"
                >
                  {(product.reviews || 0) === 0 ? 'No reviews yet' : `${product.reviews} review${product.reviews > 1 ? 's' : ''}`}
                </Link>
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  <sup className="text-sm">₹</sup>{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-lg text-gray-500 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                {product.free_delivery && (
                  <span className="flex items-center gap-1 text-deal-green font-semibold">
                    <Truck size={16} /> FREE Delivery
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Tag size={16} /> {product.category}
                </span>
              </div>

              {product.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
                </div>
              )}

              <div className="mt-auto">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className={`w-full py-3 rounded-full font-bold text-base flex items-center justify-center gap-2 transition-all ${
                    added
                      ? 'bg-green-600 text-white'
                      : 'gradient-gold text-dark shadow-lg shadow-gold/30 hover:scale-[1.02]'
                  }`}
                >
                  <ShoppingCart size={18} />
                  {added ? 'Added to Cart!' : `Add to Cart - ₹${(product.price * quantity).toLocaleString('en-IN')}`}
                </button>

                {product.stock > 0 ? (
                  <p className="text-xs text-center text-gray-500 mt-2">{product.stock} in stock</p>
                ) : (
                  <p className="text-xs text-center text-red-500 mt-2">Out of stock</p>
                )}
              </div>
            </div>
          </div>
        </div>
{/* Reviews & Ratings section */}
        <div id="reviews" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare size={20} className="text-orange" /> Customer Reviews
          </h2>

          <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
            <div className="text-center">
              <div className="text-4xl font-extrabold text-gray-900">{(product.rating || 0).toFixed(1)}</div>
              <RatingStars rating={product.rating || 0} size={16} />
              <div className="text-xs text-gray-500 mt-1">{product.reviews || 0} reviews</div>
            </div>
          </div>

          {/* Write / update a review */}
          {user ? (
            eligibility?.canReview ? (
              <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">
                  {eligibility.hasReviewed ? '✏️ Update your review' : '✍️ Write a review'}
                </h3>
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setMyRating(n)}
                      className="p-1 rounded hover:bg-gray-100 transition-colors"
                      aria-label={`${n} star`}
                    >
                      <Star size={28} className={n <= myRating ? 'fill-gold text-gold' : 'text-gray-300'} />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-semibold text-gray-700">{myRating}/5</span>
                </div>
                <textarea
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  maxLength={1000}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange mb-3"
                />
                {reviewMsg && (
                  <div className={`mb-3 text-sm ${reviewMsg.startsWith('✅') ? 'text-green-700' : 'text-red-600'}`}>
                    {reviewMsg}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="gradient-gold text-dark px-5 py-2 rounded-full font-bold text-sm shadow-lg shadow-gold/30 hover:scale-105 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : (eligibility.hasReviewed ? 'Update Review' : 'Submit Review')}
                </button>
              </form>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 mb-6">
                🔒 You can only review this product after <strong>ordering it</strong>. Add it to your cart, place an
                order, and then you'll be able to share your feedback.
              </div>
            )
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 mb-6">
              Please{' '}
              <Link to="/login" className="text-orange font-semibold hover:underline">sign in</Link> to write a review.
              Reviews are only available to customers who have ordered this product.
            </div>
          )}
{/* Review list */}
          {reviews.length === 0 ? (
            <p className="text-center text-gray-400 py-6 text-sm">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full gradient-gold flex items-center justify-center text-dark font-bold text-sm">
                      {(review.reviewer_name || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{review.reviewer_name}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="ml-auto">
                      <RatingStars rating={review.rating} size={14} />
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
