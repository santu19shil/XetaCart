import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              At <strong className="text-gray-900">XetaCart</strong>, we value your privacy and are committed to protecting any personal information you share with us.
            </p>
            <h2 className="text-xl font-bold text-gray-900 mt-6">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as your name, email address, phone number, and delivery address when you create an account or place an order.
            </p>
            <h2 className="text-xl font-bold text-gray-900 mt-6">2. How We Use Your Information</h2>
            <p>
              Your information is used solely to process your orders, communicate order updates, and improve your shopping experience. We do not sell or share your personal data with third parties for marketing purposes.
            </p>
            <h2 className="text-xl font-bold text-gray-900 mt-6">3. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.
            </p>
            <h2 className="text-xl font-bold text-gray-900 mt-6">4. Cookies</h2>
            <p>
              Our website may use cookies to enhance user experience and analyze site traffic. You can choose to disable cookies through your browser settings.
            </p>
            <h2 className="text-xl font-bold text-gray-900 mt-6">5. Third-Party Services</h2>
            <p>
              We use WhatsApp for order confirmation. Any data shared through WhatsApp is subject to WhatsApp's own privacy policy.
            </p>
            <h2 className="text-xl font-bold text-gray-900 mt-6">6. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal data. Contact us at <strong className="text-gray-900">contact@xetacart.com</strong> for any privacy-related requests.
            </p>
            <h2 className="text-xl font-bold text-gray-900 mt-6">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.
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
