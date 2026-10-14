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

  const passwordRequirements = [
    { label: 'At least 12 characters', test: (p) => p.length >= 12 },
    { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
    { label: 'One number', test: (p) => /[0-9]/.test(p) },
    { label: 'One special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
  ];

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
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Something went wrong. Please try again.';
      setError(msg);
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 flex items-center justify-between text-white rounded-t-2xl">
          <h2 className="font-rajdhani font-bold text-xl tracking-wider">
            {isRegister ? 'Create Account' : 'Sign In'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-gray-600 text-center">
            {isRegister ? 'Create your account to start shopping' : 'Sign in to place your order'}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2" role="alert">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <>
                <div>
                  <label htmlFor="prompt-name" className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <input
                      id="prompt-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                      required
                      placeholder="Enter your name"
                      autoComplete="name"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>
                <div>
                  <label htmlFor="prompt-phone" className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <input
                      id="prompt-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                      required
                      placeholder="Enter your phone number"
                      autoComplete="tel"
                    />
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>
              </>
            )}
            <div>
              <label htmlFor="prompt-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  id="prompt-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  required
                  placeholder="Enter your email"
                  autoComplete={isRegister ? 'email' : 'username'}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>
            <div>
              <label htmlFor="prompt-password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="prompt-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 pr-12 text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  required
                  placeholder="Enter your password"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {isRegister && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
                  <ul className="space-y-1">
                    {passwordRequirements.map((req, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${req.test(password) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                          {req.test(password) ? '✓' : String(idx + 1)}
                        </span>
                        <span className={`${req.test(password) ? 'text-green-700' : 'text-gray-500'}`}>{req.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {isRegister && (
              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                🛍️ By creating an account, you can start shopping. Your order details will be sent to the store via WhatsApp.
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-gray-900 py-3.5 rounded-full font-bold text-base shadow-lg shadow-amber-500/30 hover:from-amber-400 hover:to-orange-400 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={handleSwitchMode} className="text-orange-600 font-semibold hover:underline hover:text-orange-700 transition-colors">
              {isRegister ? 'Sign in' : 'Create one'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors" onClick={onClose}>
              ← Back to store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}