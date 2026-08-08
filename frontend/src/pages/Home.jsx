import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../api';
import { useCart } from '../context/CartContext';

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
  const [liked, setLiked] = useState({});
  const [heroItems, setHeroItems] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const { cartCount } = useCart();

  const applyFilters = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory && selectedCategory !== 'All' && selectedCategory !== 'All Categories') {
        params.category = selectedCategory;
      }
      if (sortBy === 'price_asc') params.sort = 'price_asc';
      if (sortBy === 'price_desc') params.sort = 'price_desc';
      const response = await productsAPI.getAll(params);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeroItems = async () => {
    try {
      const results = await Promise.all(
        CATEGORIES.map(async (cat) => {
          const res = await productsAPI.getAll({ category: cat, limit: 10 });
          const items = res.data;
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

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    fetchHeroItems();
  }, []);

  useEffect(() => {
    if (heroItems.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroItems.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [heroItems.length]);

  const toggleLike = (id) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

const goToSlide = (index) => {
    setHeroIndex(index);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-4">
      {heroItems.length > 0 && (
        <div className="hero-banner rounded-xl mb-6 relative overflow-hidden" style={{ minHeight: 320 }}>
          <div className="absolute inset-0">
            {heroItems.map((item, idx) => (
              <div
                key={item.category}
                className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                style={{ opacity: idx === heroIndex ? 1 : 0 }}
              >
                <img
                  src={item.product.image_url || 'https://placehold.co/1200x400/f0f4f8/999?text=XetaCart'}
                  alt={item.category}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              </div>
            ))}
          </div>

          <div className="relative z-10 p-8 md:p-12 flex items-center" style={{ minHeight: 320 }}>
            <div className="max-w-xl">
              <div className="text-gold font-rajdhani text-sm tracking-widest mb-2">Shop by Category</div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
                {heroItems[heroIndex]?.category}
              </h2>
              <p className="text-gray-200 text-sm md:text-base mb-6 line-clamp-2">
                {heroItems[heroIndex]?.product?.name}
              </p>
              <button
                onClick={() => onCategoryChange(heroItems[heroIndex]?.category)}
                className="gradient-gold text-dark px-6 py-3 rounded-lg font-bold shadow-lg shadow-gold/30 hover:scale-105 transition-all"
              >
                Explore {heroItems[heroIndex]?.category} →
              </button>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {heroItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === heroIndex ? 'bg-gold w-8' : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
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
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">
          {selectedCategory === 'All Categories' ? 'All Products' : selectedCategory}
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading products...</div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No products found 🔍</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} onLike={toggleLike} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
