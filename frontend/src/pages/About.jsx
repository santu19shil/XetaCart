import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">About XetaCart</h1>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              <strong className="text-gray-900">XetaCart</strong> is your local online store based in Sabroom, South Tripura. We are committed to delivering quality products at the best prices, making everyday shopping simple, fast, and affordable for our community.
            </p>
            <p>
              From groceries and gift items to household essentials, electronics, and personal care products — we aim to be your one-stop shop for everything you need. Our store is located at <strong className="text-gray-900">Jalefa Bazar, Sabroom, South Tripura, 799145</strong>.
            </p>
            <p>
              We offer flexible fulfillment options including <strong className="text-gray-900">Home Delivery</strong> (within 3 km of our store) and <strong className="text-gray-900">Store Pickup</strong>. You can place your order through our website and confirm it instantly via WhatsApp.
            </p>
            <p>
              At XetaCart, we believe in honest pricing, genuine products, and friendly customer service. Thank you for shopping with us!
            </p>
          </div>
          <div className="mt-8">
            <Link to="/" className="gradient-gold text-dark px-6 py-2.5 rounded-full font-bold shadow-lg shadow-gold/30 hover:scale-105 transition-all inline-block">
              ← Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
