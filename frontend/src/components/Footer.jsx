import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="gradient-dark text-gray-400 text-center py-8 mt-12 border-t-2 border-gold/20">
      <div className="max-w-[1400px] mx-auto px-4">
<div className="text-gold font-rajdhani font-bold text-xl tracking-wider mb-2">XETACART</div>
        <p className="text-sm mb-2">📍 Store Address: Jalefa Bazar, Sabroom, South Tripura, 799145</p>
        <p className="text-sm mb-4">📞 +91 60335 71851 | ✉️ contact@xetacart.com</p>
        <p className="text-xs">© 2026 XetaCart. Powered by deals.</p>
        <div className="flex justify-center gap-4 mt-4 text-xs">
          <span className="px-3 py-1 bg-white/5 rounded-full">About Us</span>
          <span className="px-3 py-1 bg-white/5 rounded-full">Privacy Policy</span>
          <span className="px-3 py-1 bg-white/5 rounded-full">Terms of Service</span>
          <span className="px-3 py-1 bg-white/5 rounded-full">Contact</span>
        </div>
      </div>
    </footer>
  );
}
