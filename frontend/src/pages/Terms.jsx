import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms & Conditions</h1>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Welcome to <strong className="text-gray-900">XetaCart</strong>. By accessing or using our website and services, you agree to be bound by these Terms & Conditions. Please read them carefully.
            </p>
            <h2 className="text-xl font-bold text-gray-900 mt-6">1. General Terms</h2>
            <p>
              All orders placed through XetaCart are subject to availability. We reserve the right to cancel any order at our discretion. Prices are subject to change without prior notice.
            </p>
            <h2 className="text-xl font-bold text-gray-900 mt-6">2. Order & Payment</h2>
            <p>
              Orders are confirmed via WhatsApp after you submit your request. No online payment is processed at this time. Payment methods will be discussed directly with the seller upon order confirmation.
            </p>
            <h2 className="text-xl font-bold text-gray-900 mt-6">3. Delivery & Pickup</h2>
            <p>
              Home delivery is available within a <strong className="text-gray-900">3 km radius</strong> of our store at Jalefa Bazar, Sabroom. Store pickup is also available during business hours. Delivery charges, if applicable, will be communicated at the time of order confirmation.
            </p>
            <h2 className="text-xl font-bold text-gray-900 mt-6">4. Account & Privacy</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account. We collect only necessary information to process your orders and improve your shopping experience. Read our <Link to="/privacy" className="text-orange hover:underline">Privacy Policy</Link> for more details.
            </p>
            <h2 className="text-xl font-bold text-gray-900 mt-6">5. Contact Us</h2>
            <p>
              For any queries, reach us at <strong className="text-gray-900">contact@xetacart.com</strong> or call <strong className="text-gray-900">+91 60335 71851</strong>.
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
