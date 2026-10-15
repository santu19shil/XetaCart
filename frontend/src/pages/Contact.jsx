import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { configAPI } from '../api';
import { Mail, Phone, MessageSquare, Send, CheckCircle, AlertCircle, MapPin } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('919862979945');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all required fields (Name, Email, Message).');
      return;
    }

    setLoading(true);
    const whatsappTab = window.open('about:blank', '_blank');
    if (!whatsappTab) {
      setError('Allow pop-ups for this site to open WhatsApp, then try again.');
      setLoading(false);
      return;
    }

    try {
      let number = whatsappNumber;
      try {
        const response = await configAPI.get();
        if (response.data?.whatsappNumber) number = response.data.whatsappNumber;
      } catch (configError) {
        console.warn('Using the configured fallback WhatsApp number:', configError.message);
      }
      setWhatsappNumber(number);

      const lines = [];
      lines.push('📩 *NEW CONTACT MESSAGE - XetaCart*');
      lines.push('-----------------------------');
      lines.push(`👤 *Name:* ${name}`);
      lines.push(`📧 *Email:* ${email}`);
      if (phone.trim()) lines.push(`📞 *Phone:* ${phone}`);
      if (subject.trim()) lines.push(`📋 *Subject:* ${subject}`);
      lines.push('-----------------------------');
      lines.push(`💬 *Message:*`);
      lines.push(message);
      lines.push('-----------------------------');

      const waUrl = `https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`;
      whatsappTab.opener = null;
      whatsappTab.location.href = waUrl;

      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error('Contact form error:', err);
      whatsappTab.close();
      setError('Failed to open WhatsApp. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  const formattedPhone = whatsappNumber.replace(/^91/, '+91 ').replace(/(\d{5})(\d{5})/, '$1 $2');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Contact Us</h1>
          <p className="text-gray-600 text-lg">We'd love to hear from you. Send us a message and we'll respond via WhatsApp.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {success ? (
            <div className="text-center py-10">
              <CheckCircle className="mx-auto text-deal-green mb-5" size={72} />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Message Ready to Send!</h2>
              <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">WhatsApp has opened with your message. Please send it to complete the contact request.</p>
              <button
                onClick={() => setSuccess(false)}
                className="btn-primary max-w-xs"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2" role="alert">
                  <AlertCircle size={20} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                  <div className="relative">
                    <input
                      id="contact-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                      required
                      placeholder="Your name"
                      autoComplete="name"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                  <div className="relative">
                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                      required
                      placeholder="your@email.com"
                      autoComplete="email"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1.5">Phone (Optional)</label>
                  <div className="relative">
                    <input
                      id="contact-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                      placeholder="+91 98765 43210"
                      autoComplete="tel"
                    />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-1.5">Subject (Optional)</label>
                  <select
                    id="contact-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all bg-white"
                  >
                    <option value="">Select a subject</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Order Support">Order Support</option>
                    <option value="Delivery Issue">Delivery Issue</option>
                    <option value="Product Question">Product Question</option>
                    <option value="Feedback">Feedback / Suggestion</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                <div className="relative">
                  <textarea
                    id="contact-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-y"
                    required
                    placeholder="How can we help you?"
                  />
                  <MessageSquare className="absolute left-3 top-3 text-gray-400" size={20} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3.5 rounded-full font-bold text-base shadow-lg shadow-green-600/30 hover:bg-green-700 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send size={20} />
                {loading ? 'Opening WhatsApp...' : 'Send via WhatsApp'}
              </button>

              <p className="text-center text-sm text-gray-500">
                By submitting, you'll be redirected to WhatsApp to send your message directly to our team.
              </p>
            </form>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="bg-orange-100 text-orange-600 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Phone size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
            <p className="text-gray-600 text-base">{formattedPhone}</p>
          </div>
          <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="bg-green-100 text-green-600 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">WhatsApp</h3>
            <p className="text-gray-600 text-base mb-2">Chat with us directly</p>
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-orange-600 font-medium hover:underline inline-flex items-center gap-1">
              Open WhatsApp →
            </a>
          </div>
          <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <MapPin size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Visit Us</h3>
            <p className="text-gray-600 text-base">Jalefa Bazar, Sabroom</p>
            <p className="text-gray-600 text-base">South Tripura, 799145</p>
          </div>
        </div>
      </div>
    </div>
  );
}
