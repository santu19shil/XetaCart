import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="gradient-dark text-gray-400 text-center py-8 mt-12 border-t-2 border-gold/20">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-2 mb-3">
          <img src="/logo.png" alt="XetaCart" className="h-12 w-auto object-contain" />
          <div className="text-gold font-rajdhani font-bold text-xl tracking-wider">XetaCart</div>
          <div className="text-white/60 text-[0.65rem] font-semibold tracking-[0.25rem] uppercase">Shop more, Pay less</div>
        </div>
        <p className="text-sm mb-2">📍 Store Address: Jalefa Bazar, Sabroom, South Tripura, 799145</p>
        <p className="text-sm mb-4">📞 +91 60335 71851 | ✉️ contact@xetacart.com</p>
        <p className="text-xs">© 2026 XetaCart. All rights reserved.</p>
        <p className="text-xs text-gray-500 mt-1">Designed and developed by <span className="text-gold font-semibold">Santu Shil</span></p>
        <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs">
          <Link to="/about" className="px-4 py-1.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors">About Us</Link>
          <Link to="/terms" className="px-4 py-1.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors">Terms & Conditions</Link>
          <Link to="/privacy" className="px-4 py-1.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors">Privacy Policy</Link>
          <Link to="/contact" className="px-4 py-1.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
