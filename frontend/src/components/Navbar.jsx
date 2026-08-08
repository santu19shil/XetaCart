import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ onCartClick, searchQuery, onSearchChange, selectedCategory, onCategoryChange }) {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="gradient-dark sticky top-0 z-50 shadow-lg border-b border-gold/20">
      <div className="max-w-[1400px] mx-auto px-4 py-2 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-12 h-10 rounded bg-gradient-to-br from-gold to-orange flex items-center justify-center font-rajdhani font-bold text-white text-lg shadow-lg shadow-gold/40">
            BB
          </div>
          <div className="hidden sm:block">
            <div className="text-gold font-rajdhani font-bold text-xl tracking-wider leading-none">XetaCart</div>
            <div className="text-white/60 text-[0.6rem] font-semibold tracking-[0.25rem] uppercase">Online Store</div>
          </div>
        </Link>

        <div className="hidden md:flex items-center text-gray-300 text-xs leading-tight">
          <span className="mr-1">📍</span>
          <div>
            <span className="text-white font-semibold text-sm">Store Address</span><br />
            <span className="text-white font-bold text-sm">Jalefa Bazar, Sabroom, South Tripura, 799145</span>
          </div>
        </div>

          <div className="flex-1 max-w-2xl">
            <div className="flex bg-white rounded-md shadow-md shadow-orange/30 border-2 border-orange overflow-hidden">
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="bg-gray-100 border-none text-xs px-2 py-2 text-gray-600 hidden sm:block"
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
                className="flex-1 border-none px-3 py-2 text-sm outline-none"
              />
              <button className="bg-orange px-4 hover:bg-orange/90 transition-colors">
                🔍
              </button>
            </div>
          </div>

        <div className="flex items-center gap-4 text-white text-sm flex-shrink-0">
          {user ? (
            <>
              <div className="hidden lg:block">
                <div className="text-xs text-gray-400">Hello, {user.name}</div>
                <div className="font-semibold">{user.role === 'seller' ? 'Store Owner' : 'Account'}</div>
              </div>
              {user.role === 'seller' && (
                <button onClick={() => navigate('/seller')} className="hidden lg:block text-gold hover:text-gold/80 font-semibold text-sm">
                  Seller Panel
                </button>
              )}
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

          <button onClick={() => navigate('/checkout')} className="hidden lg:block text-center hover:bg-white/10 px-2 py-1 rounded transition-colors">
            <div className="text-xs text-gray-400">Returns</div>
            <div className="font-semibold">& Orders</div>
          </button>

          <button onClick={onCartClick} className="relative flex items-center gap-1 hover:bg-white/10 px-2 py-1 rounded transition-colors">
            🛒 <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange text-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <button className="lg:hidden text-white text-2xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          ☰
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-mid border-t border-white/10 px-4 py-3 space-y-2">
          <div className="text-gray-300 text-sm">📍 Store Address: Jalefa Bazar, Sabroom, South Tripura, 799145</div>
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
