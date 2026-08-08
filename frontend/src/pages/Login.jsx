import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let loggedInUser;
      if (isRegister) {
        // Buyers create an account (role is forced to 'customer' on the backend)
        loggedInUser = await register(name, email, password, 'customer', phone);
      } else {
        loggedInUser = await login(email, password);
      }
      // Redirect sellers to the Seller Panel, customers to the store home
      navigate(loggedInUser?.role === 'seller' ? '/seller' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
<div className="text-center mb-8">
<img src="/logo.png" alt="XetaCart" className="h-20 w-auto object-contain mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-gray-900">{isRegister ? 'Create Account' : 'Sign In'}</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome to XetaCart</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange" required />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange" required minLength={6} />
            </div>

            {isRegister && (
              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                🛍️ By creating an account, you can start shopping. Your order details will be sent to the store via WhatsApp.
              </p>
            )}

            <button type="submit" className="w-full gradient-gold text-dark py-3 rounded-full font-bold shadow-lg shadow-gold/30 hover:scale-[1.02] transition-all">
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => setIsRegister(!isRegister)} className="text-orange font-semibold hover:underline">
              {isRegister ? 'Sign in' : 'Create one'}
            </button>
          </div>

<div className="mt-4 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to store</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
