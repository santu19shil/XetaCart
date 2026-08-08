import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { configAPI } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { MapPin, MessageCircle, CheckCircle, X } from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose }) {
  const [address, setAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('916033571851');
  const [storeAddress, setStoreAddress] = useState('Jalefa Bazar, Sabroom, South Tripura, 799145');
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setAddress('');
      setDeliveryMethod('delivery');
      setLoading(false);
      setSuccess(false);
    }
    const loadConfig = async () => {
      try {
        const response = await configAPI.get();
        if (response.data?.whatsappNumber) {
          setWhatsappNumber(response.data.whatsappNumber);
        }
        if (response.data?.storeAddress) {
          setStoreAddress(response.data.storeAddress);
        }
      } catch (error) {
        console.error('Failed to load store config', error);
      }
    };
    if (isOpen) loadConfig();
  }, [isOpen]);

  const buildOrderMessage = () => {
    const lines = [];
    lines.push('🛒 *NEW ORDER - XetaCart*');
    lines.push('-----------------------------');
    lines.push(`👤 *Name:* ${user?.name || ''}`);
    lines.push(`📞 *Phone:* ${user?.phone || ''}`);
    lines.push(`📧 *Email:* ${user?.email || ''}`);
    lines.push(` *Fulfillment Method:* ${deliveryMethod === 'delivery' ? 'Home Delivery' : 'Store Pickup'}`);
    lines.push(deliveryMethod === 'delivery'
      ? `📍 *Delivery Address:* ${address}`
      : `🏪 *You can collect your order from:* ${storeAddress}`);
    lines.push('-----------------------------');
    lines.push('*Items Ordered:*');
    cart.forEach((item) => {
      lines.push(
        `• ${item.name} - ₹${Number(item.price).toLocaleString('en-IN')} x ${item.quantity} = ₹${(Number(item.price) * item.quantity).toLocaleString('en-IN')}`
      );
    });
    lines.push('-----------------------------');
    lines.push(`💵 *Total: ₹${cartTotal.toLocaleString('en-IN')}*`);
    lines.push('Please confirm my order. Thank you!');
    return lines.join('\n');
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (deliveryMethod === 'delivery' && !address.trim()) return;
    if (cart.length === 0) return;
    setLoading(true);

    const message = buildOrderMessage();
    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encoded}`;

    clearCart();
    window.open(waUrl, '_blank');
    setSuccess(true);
    setLoading(false);
  };

  const handleContinueShopping = () => {
    setSuccess(false);
    setAddress('');
    setDeliveryMethod('delivery');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-[cardIn_0.3s_ease]">
        <div className="gradient-dark p-4 flex items-center justify-between text-white rounded-t-2xl">
          <h2 className="font-rajdhani font-bold text-xl tracking-wider">{success ? 'Order Confirmed' : 'Checkout'}</h2>
          {!success && (
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        {success ? (
          <div className="p-6 text-center">
            <CheckCircle className="mx-auto text-deal-green mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Order Sent to WhatsApp!</h3>
            <p className="text-gray-600 mb-2">Your order details have been sent to the seller.</p>
            <p className="text-sm text-gray-500 mb-6">Please confirm delivery on WhatsApp.</p>
            <button onClick={handleContinueShopping} className="gradient-gold text-dark px-6 py-3 rounded-full font-bold shadow-lg shadow-gold/30 hover:scale-105 transition-all">
              Continue Shopping
            </button>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Fulfillment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`border-2 rounded-xl p-3 text-left transition-all ${deliveryMethod === 'delivery' ? 'border-orange bg-orange/10' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                    <span>🏠</span> Home Delivery
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`border-2 rounded-xl p-3 text-left transition-all ${deliveryMethod === 'pickup' ? 'border-orange bg-orange/10' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                    <span>🏪</span> Store Pickup
                  </div>
                </button>
              </div>
            </div>

            {deliveryMethod === 'delivery' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Delivery Address *</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full delivery address..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange h-20"
                  required
                />
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                <MapPin size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">📦 Collect from our store</p>
                  <p className="text-xs text-blue-700 mt-1"><strong>{storeAddress}</strong></p>
                </div>
              </div>
            )}

            <div className="border border-gray-200 rounded-lg p-3 text-center text-gray-500 text-xs">
              When you place the order, your item details and contact information will be sent to the seller on WhatsApp for confirmation.
            </div>

            <button
              type="submit"
              disabled={loading || cart.length === 0}
              className="w-full bg-green-600 text-white py-3 rounded-full font-bold text-base shadow-lg shadow-green-600/30 hover:scale-[1.02] hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} />
              {loading ? 'Processing...' : `Place Order - ₹${cartTotal.toLocaleString('en-IN')}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
