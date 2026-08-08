import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { syncInsert } from '../services/sync';
import { Upload, X, Save, ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  'Groceries',
  'Gift Items',
  'Kitchenware and Utilities',
  'Toys',
  'Household Essentials',
  'Electronics and Electrical Appliances',
  'Personal Care & Wellness',
];

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    price: '',
    mrp: '',
    stock: '',
    image_url: '',
    is_lightning: false,
    free_delivery: false,
  });
  const [brands, setBrands] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchBrands = async (category) => {
    if (!category) {
      setBrands([]);
      return;
    }
    try {
      const response = await fetch(`/api/products/brands?category=${encodeURIComponent(category)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch brands');
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error('Failed to fetch brands', error);
    }
  };

  useEffect(() => {
    fetchBrands(formData.category);
  }, [formData.category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        mrp: parseFloat(formData.mrp),
        stock: parseInt(formData.stock),
      };
      await syncInsert('products', data);
      navigate('/seller');
    } catch (error) {
      console.error('Failed to create product', error);
      alert('Failed to create product: ' + (error.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('image', file);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      });
      if (!response.ok) throw new Error('Upload failed');
      const result = await response.json();
      setFormData(prev => ({ ...prev, image_url: result.url }));
    } catch (error) {
      console.error('Upload failed', error);
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="gradient-dark py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between text-white">
          <div>
            <h1 className="text-xl font-rajdhani font-bold text-gold tracking-wider">Add New Product</h1>
            <p className="text-gray-400 text-sm mt-1">Fill in the details to list your product on XetaCart</p>
          </div>
          <button
            onClick={() => navigate('/seller')}
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
                placeholder="e.g., Apple iPhone 15 Pro"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value, brand: '' })}
                className={inputClass}
                required
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
              {brands.length > 0 ? (
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select a brand</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                  <option value="__custom__">+ Add new brand</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className={inputClass}
                  placeholder="Enter brand name"
                />
              )}
              {formData.brand === '__custom__' && (
                <input
                  type="text"
                  value=""
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className={`${inputClass} mt-2`}
                  placeholder="Enter new brand name"
                  autoFocus
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className={inputClass}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MRP (₹) *</label>
              <input
                type="number"
                value={formData.mrp}
                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                className={inputClass}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className={inputClass}
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={inputClass}
                placeholder="Detailed product description..."
                rows="3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
              <div className="flex items-end gap-4">
                {formData.image_url ? (
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-24 h-24 object-contain border border-gray-300 rounded-lg"
                  />
                ) : (
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
                <label className="gradient-gold text-dark px-4 py-2 rounded-lg font-bold cursor-pointer flex items-center gap-2 shadow-md shadow-gold/30 hover:scale-105 transition-all">
                  <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className={inputClass}
                placeholder="Or paste image URL"
              />
            </div>

            <div className="md:col-span-2 flex gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.is_lightning}
                  onChange={(e) => setFormData({ ...formData, is_lightning: e.target.checked })}
                  className="accent-orange"
                />
                Lightning Deal
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.free_delivery}
                  onChange={(e) => setFormData({ ...formData, free_delivery: e.target.checked })}
                  className="accent-orange"
                />
                Free Delivery
              </label>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/seller')}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="gradient-gold text-dark px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-gold/30 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={16} />
                {loading ? 'Saving...' : 'Add Product'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
