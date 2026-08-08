import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { syncInsert, syncUpdate, syncDelete } from '../services/sync';
import { Trash2, Edit, Plus, Upload, X } from 'lucide-react';

const CATEGORIES = [
  'Groceries',
  'Gift Items',
  'Kitchenware and Utilities',
  'Toys',
  'Household Essentials',
  'Electronics and Electrical Appliances',
  'Personal Care & Wellness',
];

export default function SellerDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
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
    hot_percentage: 0,
    free_delivery: false,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products/seller/my-products', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
      alert('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        mrp: parseFloat(formData.mrp),
        stock: parseInt(formData.stock),
        hot_percentage: parseInt(formData.hot_percentage) || 0,
      };

      if (editingProduct) {
        await syncUpdate('products', editingProduct.id, data);
      } else {
        await syncInsert('products', data);
      }

      setShowForm(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        brand: '',
        price: '',
        mrp: '',
        stock: '',
        image_url: '',
        is_lightning: false,
        hot_percentage: 0,
        free_delivery: false,
      });
      fetchProducts();
    } catch (error) {
      console.error('Failed to save product', error);
      alert('Failed to save product: ' + (error.message || 'Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      brand: product.brand || '',
      price: product.price.toString(),
      mrp: product.mrp.toString(),
      stock: product.stock.toString(),
      image_url: product.image_url || '',
      is_lightning: product.is_lightning,
      hot_percentage: product.hot_percentage || 0,
      free_delivery: product.free_delivery,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await syncDelete('products', id);
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="gradient-dark py-6">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-rajdhani font-bold text-gold tracking-wider">Seller Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your products and inventory</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">My Products ({products.length})</h2>
          <button
            onClick={() => navigate('/seller/add-product')}
            className="gradient-gold text-dark px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-gold/30 hover:scale-105 transition-all w-full sm:w-auto justify-center"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange"
                  required
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MRP (₹) *</label>
                <input
                  type="number"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hot %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.hot_percentage}
                  onChange={(e) => setFormData({ ...formData, hot_percentage: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange h-20"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="Image URL"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange"
                  />
                  <label className="gradient-gold text-dark px-4 py-2 rounded-full font-bold cursor-pointer flex items-center gap-2 shadow-md shadow-gold/30">
                    <Upload size={16} /> Upload
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
                {formData.image_url && (
                  <img src={formData.image_url} alt="Preview" className="mt-2 h-20 object-contain" />
                )}
              </div>
              <div className="flex gap-4 md:col-span-2">
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
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={saving} className="gradient-gold text-dark px-6 py-2 rounded-full font-bold shadow-lg shadow-gold/30 hover:scale-105 transition-all disabled:opacity-50">
                  {saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                </button>
                <button type="button" onClick={() => setShowForm(false)} disabled={saving} className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading products...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700">Product</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Code</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Category</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Price</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Stock</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={product.image_url || 'https://placehold.co/40x40/f0f4f8/999?text=P'} alt="" className="w-10 h-10 object-contain bg-gray-100 rounded" />
                          <span className="font-medium text-gray-900 line-clamp-1 max-w-xs">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{product.product_code || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{product.category}</td>
                      <td className="px-4 py-3 font-semibold text-deal-red">₹{product.price.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {product.stock} in stock
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(product)} disabled={saving} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(product.id)} disabled={saving} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {products.length === 0 && (
              <div className="text-center py-12 text-gray-400">No products yet. Add your first product!</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
