import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { configAPI } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { MapPin, MessageCircle, CheckCircle } from 'lucide-react';

export default function Checkout() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('916033571851');
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await configAPI.get();
        if (response.data?.whatsappNumber) {
          setWhatsappNumber(response.data.whatsappNumber);
        }
      } catch (error) {
        console.error('Failed to load store config', error);
      }
    };
    loadConfig();
  }, []);

  const buildOrderMessage = () => {
    const lines = [];
lines.push('🛒 *NEW ORDER - XetaCart*');
    lines.push('-----------------------------');
    lines.push(`👤 *Name:* ${user?.name || ''}`);
    lines.push(`📞 *Phone:* ${user?.phone || ''}`);
    lines.push(`📧 *Email:* ${user?.email || ''}`);
    lines.push(`📍 *Delivery Address:* ${address}`);
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
    if (!address.trim()) return;
    if (cart.length === 0) return;
    setLoading(true);

    const message = buildOrderMessage();
    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encoded}`;

    // Clear the cart after building the message
    clearCart();

    // Open WhatsApp with the order details
    window.open(waUrl, '_blank');

    setSuccess(true);
    setLoading(false);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="mx-auto text-deal-green mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Sent to WhatsApp!</h2>
          <p className="text-gray-600 mb-2">Your order details have been sent to the seller.</p>
          <p className="text-sm text-gray-500 mb-2">Please confirm delivery on WhatsApp.</p>
          <p className="text-xs text-gray-400 mb-6">📍 Deliver to: {address}</p>
          <button onClick={() => navigate('/')} className="gradient-gold text-dark px-6 py-3 rounded-full font-bold shadow-lg shadow-gold/30 hover:scale-105 transition-all">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handlePlaceOrder} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-orange" /> Delivery Details
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your full delivery address..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange h-24"
                    required
                  />
                </div>
                <div className="bg-orange/10 border border-orange/20 rounded-lg p-3 flex items-start gap-2">
                  <MapPin size={16} className="text-orange mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-700">
                    We deliver from our store at <strong>Jalefa Bazar, Sabroom, South Tripura, 799145</strong>
                  </p>
                </div>
              </div>

              <h2 className="text-lg font-bold text-gray-900 mt-6 mb-4 flex items-center gap-2">
                <MessageCircle size={20} className="text-deal-green" /> Order via WhatsApp
              </h2>
              <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-500 text-sm">
                When you place the order, your item details and contact information will be sent to the seller on WhatsApp for confirmation.
              </div>

              <button
                type="submit"
                disabled={loading || cart.length === 0}
                className="w-full bg-green-600 text-white py-3 rounded-full font-bold text-lg shadow-lg shadow-green-600/30 hover:scale-[1.02] hover:bg-green-700 transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                {loading ? 'Processing...' : `Order via WhatsApp - ₹${cartTotal.toLocaleString('en-IN')}`}
              </button>
            </form>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item.cart_item_id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate flex-1 mr-2">{item.name} x{item.quantity}</span>
                    <span className="font-medium">₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-deal-red">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
