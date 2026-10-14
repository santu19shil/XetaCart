import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, X, User, Mail, Lock, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPrompt({ isOpen, onClose, onSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        loggedInUser = await register(name, email, password, phone);
      } else {
        loggedInUser = await login(email, password);
      }
      if (onSuccess) {
        await onSuccess(loggedInUser);
        onClose();
      } else {
        onClose();
        navigate(loggedInUser?.role === 'seller' ? '/seller' : '/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleSwitchMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setShowPassword(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-[cardIn_0.3s_ease]">
        <div className="gradient-dark p-4 flex items-center justify-between text-white rounded-t-2xl">
          <h2 className="font-rajdhani font-bold text-xl tracking-wider">
            {isRegister ? 'Create Account' : 'Sign In'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Sign in or create an account to place your order.
          </p>
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                      required
                      placeholder="Enter your name"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                      required
                      placeholder="Enter your phone number"
                    />
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                  required
                  placeholder="Enter your email"
                  autoComplete={isRegister ? 'email' : 'username'}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pl-10 pr-12 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                  required
                  minLength={6}
                  placeholder="Enter your password"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-800"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isRegister && (
              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                🛍️ By creating an account, you can start shopping. Your order details will be sent to the store via WhatsApp.
              </p>
            )}

            <button
              type="submit"
              className="w-full gradient-gold text-dark py-3 rounded-full font-bold shadow-lg shadow-gold/30 hover:scale-[1.02] transition-all"
            >
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={handleSwitchMode} className="text-orange font-semibold hover:underline">
              {isRegister ? 'Sign in' : 'Create one'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700" onClick={onClose}>
              ← Back to store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
