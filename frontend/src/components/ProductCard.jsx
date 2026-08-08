import { ShoppingCart, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    await addToCart(product.id, 1);
  };

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div
      className="card-3d bg-white rounded-xl overflow-hidden cursor-pointer animate-card-in relative"
      style={{ animationDelay: `${index * 0.06}s` }}
      onClick={handleClick}
      onMouseMove={(e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
        if (dist < 220) {
          card.style.transform = `rotateY(${dx * 10}deg) rotateX(${-dy * 7}deg) translateZ(20px) scale(1.04)`;
        } else {
          card.style.transform = '';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
      }}
    >
      <div className="relative h-36 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
        {product.is_lightning && (
          <div className="absolute top-2 left-2 gradient-gold text-dark text-xs font-bold px-2 py-1 rounded shadow-lg shadow-gold/40 z-10 flex items-center gap-1">
            <Zap size={12} /> Lightning
          </div>
        )}
        <img
          src={product.image_url || 'https://placehold.co/200x200/f0f4f8/999?text=No+Image'}
          alt={product.name}
          className="w-24 h-24 sm:w-32 sm:h-32 object-contain relative z-[2] transition-all duration-300 hover:scale-110 drop-shadow-lg"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://placehold.co/200x200/f0f4f8/999?text=Image';
          }}
        />
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-deal-red text-white text-xs font-bold px-1.5 py-0.5 rounded">{product.discount}% off</span>
          <span className="text-deal-red text-xs font-semibold">Limited deal</span>
        </div>
<h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 leading-snug">{product.name}</h3>
        {product.product_code && (
          <div className="text-[0.65rem] text-gray-400 font-medium mb-2">Code: {product.product_code}</div>
        )}
        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
          <span className="text-lg font-bold text-gray-900">
            <sup className="text-xs">₹</sup>{product.price.toLocaleString('en-IN')}
          </span>
          <span className="text-sm text-gray-500 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
        </div>
        {product.free_delivery && (
          <div className="text-deal-green text-xs font-semibold mb-2">✓ FREE Delivery</div>
        )}
        <div className="mb-2">
          <div className="text-xs text-deal-red font-semibold mb-1">🔥 {product.hot_percentage || 0}% claimed</div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${product.hot_percentage || 0}%`,
                background: 'linear-gradient(90deg, var(--orange), var(--deal-red))'
              }}
            />
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          className="w-full gradient-gold text-dark border-none rounded-full py-2 text-sm font-bold cursor-pointer transition-all hover:scale-105 shadow-md shadow-gold/30 active:scale-95"
        >
          <ShoppingCart size={14} className="inline mr-1" /> Add to Cart
        </button>
      </div>
    </div>
  );
}
