import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../api';
import { useCart } from '../context/CartContext';
import { ShoppingCart, ArrowLeft, Zap, Truck, Tag } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
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
    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    await addToCart(product.id, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
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
      </div>
    </div>
  );
}
