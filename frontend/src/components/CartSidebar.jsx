import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartSidebar({ isOpen, onClose, onCheckout }) {
  const { cart, cartTotal, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[9999] flex flex-col animate-slide-in">
        <div className="gradient-dark p-4 flex items-center justify-between text-white">
          <h2 className="font-rajdhani font-bold text-xl tracking-wider">Shopping Cart ({cart.length})</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cart_item_id} className="flex gap-3 border border-gray-100 rounded-lg p-3 shadow-sm">
                <img
                  src={item.image_url || 'https://placehold.co/80x80/f0f4f8/999?text=Product'}
                  alt={item.name}
                  className="w-20 h-20 object-contain bg-gray-50 rounded"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                  <p className="text-deal-red font-bold text-sm mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => removeItem(item.cart_item_id)}
                      className="ml-auto text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-3">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Subtotal</span>
              <span className="text-deal-red">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full gradient-gold text-dark py-3 rounded-full font-bold text-lg shadow-lg shadow-gold/30 hover:scale-[1.02] transition-all"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={clearCart}
              className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
