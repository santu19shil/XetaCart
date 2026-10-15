import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import CheckoutModal from './components/CheckoutModal';
import Home from './pages/Home';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import SellerPanel from './pages/SellerPanel';
import AddProduct from './pages/AddProduct';
import Account from './pages/Account';
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import ProductDetail from './pages/ProductDetail';
import { useAuth } from './context/AuthContext';

function SellerOnly({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'seller' ? children : <Navigate to="/" replace />;
}

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const { loading, user } = useAuth();
  const isSeller = user?.role === 'seller';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <img src="/logo.png" alt="XetaCart" className="h-20 w-auto object-contain mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading XetaCart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#eaeded', minHeight: '100vh' }}>
      <Navbar
        onCartClick={() => setCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <main className="flex-1" style={{ background: '#eaeded' }}>
        <Routes>
          <Route path="/" element={isSeller ? <Navigate to="/seller" replace /> : <Home searchQuery={searchQuery} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />} />
          <Route path="/login" element={user ? <Navigate to={isSeller ? '/seller' : '/'} replace /> : <Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="/checkout" element={isSeller ? <Navigate to="/seller" replace /> : <Checkout />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/seller" element={<SellerOnly><SellerPanel /></SellerOnly>} />
          <Route path="/seller/add-product" element={<SellerOnly><AddProduct /></SellerOnly>} />
        </Routes>
      </main>
      {!isSeller && <Footer />}
      {!isSeller && <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />}
      {!isSeller && <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />}
    </div>
  );
}
