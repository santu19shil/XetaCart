import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import SellerPanel from './pages/SellerPanel';
import AddProduct from './pages/AddProduct';
import { useAuth } from './context/AuthContext';

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 gradient-gold rounded-lg flex items-center justify-center font-rajdhani font-bold text-white text-2xl shadow-lg shadow-gold/40 mx-auto mb-4 animate-pulse">
            XC
          </div>
          <p className="text-gray-600">Loading XetaCart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        onCartClick={() => setCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home searchQuery={searchQuery} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/seller" element={<SellerPanel />} />
          <Route path="/seller/add-product" element={<AddProduct />} />
        </Routes>
      </main>
      <Footer />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
