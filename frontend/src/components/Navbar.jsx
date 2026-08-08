import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ onCartClick, searchQuery, onSearchChange, selectedCategory, onCategoryChange }) {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSeller = user?.role === 'seller';

  const handleCartClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    onCartClick();
  };

  return (
    <nav className="gradient-dark sticky top-0 z-50 shadow-lg border-b border-gold/20">
<div className="max-w-[1400px] mx-auto px-2 sm:px-4 py-2 flex items-center gap-2 sm:gap-4">
        <Link to={isSeller ? '/seller' : '/'} className="flex items-center gap-2 flex-shrink-0">
          <img src="/logo.png" alt="XetaCart" className="h-8 sm:h-10 w-auto object-contain" />
          <div className="hidden md:block">
            <div className="text-gold font-rajdhani font-bold text-xl tracking-wider leading-none">XetaCart</div>
            <div className="text-white/60 text-[0.6rem] font-semibold tracking-[0.25rem] uppercase">Shop more, Pay less</div>
          </div>
        </Link>

        <div className="flex-1 min-w-0 max-w-2xl">
          <div className="flex bg-white rounded-md shadow-md shadow-orange/30 border-2 border-orange overflow-hidden">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="bg-gray-100 border-none text-[9px] px-1 py-1 text-gray-600 hidden sm:block"
            >
              <option>All Categories</option>
              <option>Groceries</option>
              <option>Gift Items</option>
              <option>Kitchenware and Utilities</option>
              <option>Toys</option>
              <option>Household Essentials</option>
              <option>Electronics and Electrical Appliances</option>
              <option>Personal Care & Wellness</option>
            </select>
            <input
              type="text"
              placeholder="Search products, brands and more..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 border-none px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm outline-none min-w-0"
            />
            <button className="bg-orange px-2 sm:px-4 hover:bg-orange/90 transition-colors">
              🔍
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-4 text-white text-sm flex-shrink-0 ml-auto">
          {user ? (
            <>
              {!isSeller && (
                <button onClick={handleCartClick} className="relative flex items-center gap-1 hover:bg-white/10 px-1 sm:px-2 py-1 rounded transition-colors">
                  🛒 <span className="hidden sm:inline">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange text-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
              {user.role === 'seller' && (
                <button onClick={() => navigate('/seller')} className="hidden lg:block text-gold hover:text-gold/80 font-semibold text-sm">
                  Seller Panel
                </button>
              )}
              <Link to="/account" className="hidden lg:block hover:bg-white/10 px-2 py-1 rounded transition-colors">
                <div className="text-xs text-gray-400">Hello, {user.name}</div>
                <div className="font-semibold">{user.role === 'seller' ? 'Store Owner' : 'Account & Lists'}</div>
              </Link>
              <button onClick={logout} className="text-xs text-gray-400 hover:text-white">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="hidden lg:block">
              <div className="text-xs text-gray-400">Hello, Sign in</div>
              <div className="font-semibold">Account & Lists ▾</div>
            </Link>
          )}
        </div>

        <button className="lg:hidden text-white text-2xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          ☰
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-mid border-t border-white/10 px-4 py-3 space-y-2">
          {user && (
            <>
              {user.role === 'seller' && (
                <button onClick={() => navigate('/seller')} className="block w-full text-left text-gold py-1">Seller Panel</button>
              )}
              <button onClick={logout} className="block w-full text-left text-gray-400 py-1">Logout</button>
            </>
          )}
          {!user && (
            <Link to="/login" className="block text-gold py-1">Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
}
