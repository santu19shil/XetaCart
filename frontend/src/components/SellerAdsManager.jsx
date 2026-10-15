import { useEffect, useState } from 'react';
import { adsAPI, uploadAPI } from '../api';
import { ImagePlus, LoaderCircle, Plus, Trash2, Upload } from 'lucide-react';

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'The request could not be completed.';

export default function SellerAdsManager({ products }) {
  const [ads, setAds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ title: '', subtitle: '', image_url: '', product_id: '' });

  const fetchAds = async () => {
    setLoading(true);
    try {
      const { data } = await adsAPI.getAllForSeller();
      setAds(Array.isArray(data) ? data : []);
      setMessage('');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const body = new FormData();
    body.append('image', file);
    setUploading(true);
    setMessage('');
    try {
      const { data } = await uploadAPI.upload(body);
      setForm((current) => ({ ...current, image_url: data.url }));
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const { data } = await adsAPI.create({
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        image_url: form.image_url,
        product_id: form.product_id ? Number(form.product_id) : null,
        is_active: true,
        sort_order: ads.length,
      });
      setAds((current) => [...current, data]);
      setForm({ title: '', subtitle: '', image_url: '', product_id: '' });
      setShowForm(false);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const toggleAd = async (ad) => {
    setMessage('');
    try {
      const { data } = await adsAPI.update(ad.id, { is_active: !ad.is_active });
      setAds((current) => current.map((item) => item.id === ad.id ? { ...item, ...data } : item));
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  const deleteAd = async (ad) => {
    if (!window.confirm(`Delete “${ad.title}” from the hero ads?`)) return;
    setMessage('');
    try {
      await adsAPI.delete(ad.id);
      setAds((current) => current.filter((item) => item.id !== ad.id));
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  return (
    <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Storefront hero ads</h2>
          <p className="mt-1 text-sm text-gray-500">Upload a banner to show it in the customer homepage hero.</p>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm((visible) => !visible); setMessage(''); }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 font-bold text-gray-900 shadow-md"
        >
          <Plus size={18} /> {showForm ? 'Close form' : 'Create hero ad'}
        </button>
      </div>

      {message && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
          {message}
        </p>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="mt-5 grid gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2 sm:p-5">
          <div>
            <label htmlFor="hero-ad-title" className="mb-1 block text-sm font-medium text-gray-700">Ad title</label>
            <input
              id="hero-ad-title"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              maxLength={255}
              required
              placeholder="Summer offers"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="hero-ad-product" className="mb-1 block text-sm font-medium text-gray-700">Link to a product (optional)</label>
            <select
              id="hero-ad-product"
              value={form.product_id}
              onChange={(event) => setForm((current) => ({ ...current, product_id: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="">Browse products button</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="hero-ad-subtitle" className="mb-1 block text-sm font-medium text-gray-700">Subtitle (optional)</label>
            <textarea
              id="hero-ad-subtitle"
              value={form.subtitle}
              onChange={(event) => setForm((current) => ({ ...current, subtitle: event.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Add a short message for customers"
            />
          </div>
          <div className="sm:col-span-2">
            <span className="mb-1 block text-sm font-medium text-gray-700">Hero image</span>
            <p className="mb-3 text-xs text-gray-500">Choose a wide banner image, up to 5 MB. The whole image is shown without cropping.</p>
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100">
              {uploading ? <LoaderCircle size={18} className="animate-spin" /> : <Upload size={18} />}
              {uploading ? 'Uploading…' : form.image_url ? 'Choose another image' : 'Upload image'}
              <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleImageUpload} disabled={uploading} className="sr-only" />
            </label>
            {form.image_url ? (
              <img src={form.image_url} alt="Hero ad preview" className="mt-3 max-h-40 w-full rounded-lg bg-gray-900 object-contain" />
            ) : (
              <div className="mt-3 flex h-28 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400">
                <ImagePlus size={24} />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button type="submit" disabled={saving || uploading || !form.image_url} className="rounded-full bg-gray-900 px-5 py-2.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? 'Publishing…' : 'Publish hero ad'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-gray-300 px-5 py-2.5 font-medium text-gray-700">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-gray-500">Loading hero ads…</p>
      ) : ads.length > 0 ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {ads.map((ad) => (
            <article key={ad.id} className="overflow-hidden rounded-xl border border-gray-200">
              <img src={ad.image_url} alt={ad.title} className="h-36 w-full bg-gray-900 object-contain" />
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-gray-900">{ad.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{ad.subtitle || 'No subtitle'} · {ad.is_active ? 'Shown to customers' : 'Hidden from customers'}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button type="button" onClick={() => toggleAd(ad)} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700">
                    {ad.is_active ? 'Hide' : 'Show'}
                  </button>
                  <button type="button" onClick={() => deleteAd(ad)} aria-label={`Delete ${ad.title}`} className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        !showForm && <p className="py-8 text-center text-sm text-gray-500">No hero ads yet. Create one to promote it on the storefront.</p>
      )}
    </section>
  );
}
