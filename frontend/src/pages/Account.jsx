import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Save, User, Phone, Mail, Package, Home, LogOut, ArrowLeft } from 'lucide-react';

export default function Account() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const data = { name: formData.name, phone: formData.phone };
      if (password) data.password = password;
      await updateProfile(data);
      setEditing(false);
      setPassword('');
      setMessage('✅ Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Failed to update profile'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            {message}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="gradient-dark p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center text-dark font-rajdhani font-bold text-2xl">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div className="text-xs text-gray-300">Welcome back</div>
                <div className="text-xl font-bold">{user.name}</div>
                <div className="text-sm text-gold">{user.email}</div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {!editing ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <div className="text-xs text-gray-500 flex items-center gap-1"><User size={12} /> Full Name</div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <div className="text-xs text-gray-500 flex items-center gap-1"><Mail size={12} /> Email</div>
                    <div className="font-medium text-gray-900">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <div className="text-xs text-gray-500 flex items-center gap-1"><Phone size={12} /> Phone</div>
                    <div className="font-medium text-gray-900">{user.phone || 'Not provided'}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <div className="text-xs text-gray-500 flex items-center gap-1"><Package size={12} /> Role</div>
                    <div className="font-medium text-gray-900 capitalize">{user.role}</div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="gradient-gold text-dark px-5 py-2 rounded-full font-bold text-sm shadow-lg shadow-gold/30 hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <Save size={15} /> Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2 rounded-full border border-red-300 text-red-600 font-medium text-sm hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (cannot be changed)</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    minLength={6}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="gradient-gold text-dark px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-gold/30 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={15} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditing(false); setPassword(''); setMessage(''); }}
                    className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Home size={18} className="text-orange" /> Quick Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/checkout" className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 text-sm">
              🛒 Checkout / Place Order
            </Link>
            <Link to="/" className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 text-sm">
              🏪 Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
