import { useState } from 'react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Get in Touch</h2>
              <div className="space-y-4 text-gray-600">
                <div className="flex items-start gap-3">
                  <MapPin className="text-orange mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">Store Address</p>
                    <p className="text-sm">Jalefa Bazar, Sabroom, South Tripura, 799145</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="text-orange mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-sm">+91 60335 71851</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="text-orange mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-sm">contact@xetacart.com</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Send a Message</h2>
              {submitted ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  Thank you for reaching out! We will get back to you soon.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Your Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                    required
                  />
                  <textarea
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange h-28"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full gradient-gold text-dark py-2.5 rounded-full font-bold shadow-lg shadow-gold/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={18} /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
          <div className="mt-8">
            <a href="/" className="gradient-gold text-dark px-6 py-2.5 rounded-full font-bold shadow-lg shadow-gold/30 hover:scale-105 transition-all inline-block">
              ← Back to Store
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
