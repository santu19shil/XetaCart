import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productsAPI, adsAPI } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Groceries',
  'Gift Items',
  'Kitchenware and Utilities',
  'Toys',
  'Household Essentials',
  'Electronics and Electrical Appliances',
  'Personal Care & Wellness',
];

const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'popularity', label: 'Popularity' },
];

export default function Home({ searchQuery, selectedCategory, onCategoryChange }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [heroItems, setHeroItems] = useState([]);
  const [ads, setAds] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const { cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // The hero carousel shows seller ads when they exist, otherwise it falls
  // back to one random product per category.
  const slides =
    user?.role !== 'seller' && ads.length > 0
      ? ads.map((ad) => ({ type: 'ad', ...ad }))
      : heroItems.map((item) => ({ type: 'category', ...item }));

  const applyFilters = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory && selectedCategory !== 'All' && selectedCategory !== 'All Categories') {
        params.category = selectedCategory;
      }
      params.sort = sortBy;
      const response = await productsAPI.getAll(params);
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch products', error);
      setProducts([]);
      setLoadError(error.response?.data?.message || 'Products could not be loaded. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHeroItems = async () => {
    try {
      const results = await Promise.all(
        CATEGORIES.map(async (cat) => {
          const res = await productsAPI.getAll({ category: cat, limit: 10 });
          const items = Array.isArray(res.data) ? res.data : [];
          if (items.length === 0) return null;
          const randomItem = items[Math.floor(Math.random() * items.length)];
          return { category: cat, product: randomItem };
        })
      );
      setHeroItems(results.filter(Boolean));
    } catch (error) {
      console.error('Failed to fetch hero items', error);
    }
  };

  const fetchAds = async () => {
    try {
      const response = await adsAPI.getAll();
      setAds(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.warn('Ads unavailable (table may not exist):', error.message);
      setAds([]);
    }
  };

  const onHeroAction = (slide) => {
    if (slide.type === 'ad') {
      if (slide.product_id) {
        navigate(`/product/${slide.product_id}`);
      } else {
        document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (slide.type === 'category') {
      onCategoryChange(slide.category);
    }
  };

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    fetchHeroItems();
    fetchAds();
  }, []);

  // Reset the slide index whenever the slide set changes.
  useEffect(() => {
    setHeroIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setHeroIndex(index);
  };

  const currentSlide = slides.length > 0 ? slides[heroIndex % slides.length] : null;

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-4">
      {slides.length > 0 && currentSlide && (
        <div className="hero-banner rounded-xl mb-6 relative overflow-hidden bg-gray-900" style={{ height: 'clamp(280px, 38vw, 520px)' }}>
          <div className="absolute inset-0">
            {slides.map((slide, idx) => (
              <div
                key={slide.id || slide.category || idx}
                className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                style={{ opacity: idx === heroIndex % slides.length ? 1 : 0 }}
              >
                <img
                  src={slide.type === 'ad' ? slide.image_url : slide.product?.image_url || 'https://placehold.co/1200x400/f0f4f8/999?text=XetaCart'}
                  alt={slide.type === 'ad' ? slide.title : slide.category}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/1200x400/f0f4f8/999?text=XetaCart';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              </div>
            ))}
          </div>

          <div className="relative z-10 h-full p-5 sm:p-8 md:p-12 flex items-center">
            <div className="max-w-xl">
              <div className="text-gold font-rajdhani text-xs sm:text-sm tracking-widest mb-1 sm:mb-2 uppercase">
                {currentSlide.type === 'ad' ? '⭐ Sponsored' : 'Shop by Category'}
              </div>
              <h2 className="text-xl sm:text-3xl md:text-5xl font-extrabold text-white mb-2 sm:mb-3">
                {currentSlide.type === 'ad' ? currentSlide.title : currentSlide.category}
              </h2>
              <p className="text-gray-200 text-xs sm:text-sm md:text-base mb-3 sm:mb-6 line-clamp-1 sm:line-clamp-2">
                {currentSlide.type === 'ad' ? currentSlide.subtitle || '' : currentSlide.product?.name}
              </p>
              <button
                onClick={() => onHeroAction(currentSlide)}
                className="gradient-gold text-dark px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold shadow-lg shadow-gold/30 hover:scale-105 transition-all text-sm sm:text-base"
              >
                {currentSlide.type === 'ad'
                  ? (currentSlide.product_id ? 'Shop Now →' : 'Browse Products →')
                  : `Explore ${currentSlide.category} →`}
              </button>
            </div>
          </div>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`carousel-indicator w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
                  idx === heroIndex % slides.length ? 'bg-gold w-5 sm:w-8' : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Show slide ${idx + 1}`}
                onClick={() => goToSlide(idx)}
              />
            ))}
          </div>
        </div>
      )}
{user?.role !== 'seller' && <div id="products-section" className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => onCategoryChange('All Categories')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            selectedCategory === 'All Categories'
              ? 'bg-dark text-white shadow-lg shadow-black/25'
              : 'bg-white border border-gray-300 hover:bg-dark hover:text-white'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-dark text-white shadow-lg shadow-black/25'
                : 'bg-white border border-gray-300 hover:bg-dark hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>}

      {user?.role !== 'seller' && <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="text-base sm:text-xl font-bold text-gray-900">
          {selectedCategory === 'All Categories' ? 'All Products' : selectedCategory}
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-orange"
          style={{ width: '10rem', flex: '0 0 10rem', padding: '0.375rem 0.625rem' }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading products...</div>
      ) : loadError ? (
        <div className="text-center py-12" role="alert">
          <p className="mb-3 text-red-700">{loadError}</p>
          <button type="button" onClick={applyFilters} className="rounded-full bg-gray-900 px-5 py-2 font-semibold text-white hover:bg-gray-700">
            Try again
          </button>
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No products found 🔍</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
