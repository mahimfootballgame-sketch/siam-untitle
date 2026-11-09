import React, { useState, useEffect } from 'react';
import { Advertisement } from '../../../types';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Search,
  Filter,
  ExternalLink,
  MousePointerClick,
  BarChart2,
  Calendar,
  X,
  Layers,
  Sparkles,
  Clock,
  Smartphone,
} from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { ImageUploadInput } from '../../common/ImageUploadInput';
import { SafeLink } from '../../common/SafeLink';
import { apiRequest } from '../../../services/api';
import { useAppDispatch } from '../../../app/hooks';
import { addToast } from '../../../features/ui/uiSlice';

const AVAILABLE_PLACEMENTS = [
  { id: 'homepage_hero', label: 'Homepage Hero Area' },
  { id: 'between_sections', label: 'Between Sections (Homepage)' },
  { id: 'homepage_top_bar', label: 'Homepage Top Bar' },
  { id: 'plp_top', label: 'Product Listing Page (Top Banner)' },
  { id: 'plp_sidebar', label: 'Product Listing Page (Sidebar)' },
  { id: 'pdp_sidebar', label: 'Product Detail Page (Sidebar)' },
  { id: 'pdp_bottom', label: 'Product Detail Page (Bottom)' },
  { id: 'category_header', label: 'Category Page Header' },
  { id: 'footer', label: 'Footer Promotional Area' },
  { id: 'popup_modal', label: 'Floating / Pop-up Promo' },
];

export const AdvertisementsManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    active: 0,
    expired: 0,
    totalImpressions: 0,
    totalClicks: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [placementFilter, setPlacementFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

  const defaultForm = {
    name: '',
    title: '',
    subtitle: '',
    description: '',
    promoBadge: '',
    mainImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
    secondaryImage: '',
    backgroundColor: '#051329',
    gradient: 'from-blue-950 via-slate-900 to-slate-950',
    textColor: '#ffffff',
    cta: {
      enabled: true,
      label: 'Shop Now',
      url: '/shop',
      target: '_self' as '_self' | '_blank',
      variant: 'primary' as 'primary' | 'secondary' | 'outline' | 'dark' | 'light',
      bgColor: '#2563eb',
      textColor: '#ffffff',
    },
    closeButton: {
      enabled: true,
      position: 'top-right' as 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left',
      appearance: 'circle' as 'minimal' | 'circle' | 'pill' | 'dark' | 'light',
      dismissalPolicy: 'session' as 'until_reload' | 'session' | 'duration' | 'until_expiration',
      dismissalDurationHours: 24,
    },
    placements: ['between_sections'],
    deviceTargeting: 'all' as 'all' | 'desktop_only' | 'mobile_only' | 'tablet_only',
    priority: 1,
    status: 'published' as 'draft' | 'published' | 'archived',
    startDate: '',
    endDate: '',
  };

  const [form, setForm] = useState(defaultForm);

  const fetchAds = async () => {
    setIsLoading(true);
    const query = new URLSearchParams();
    if (searchQuery) query.set('search', searchQuery);
    if (statusFilter !== 'all') query.set('status', statusFilter);
    if (placementFilter !== 'all') query.set('placement', placementFilter);

    const res = await apiRequest(`/advertisements?${query.toString()}`);
    setIsLoading(false);
    if (res.success) {
      setAds(res.advertisements || []);
      if (res.stats) setStats(res.stats);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [statusFilter, placementFilter]);

  const handleOpenCreate = () => {
    setEditingAd(null);
    setForm(defaultForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setForm({
      name: ad.name,
      title: ad.title,
      subtitle: ad.subtitle || '',
      description: ad.description || '',
      promoBadge: ad.promoBadge || '',
      mainImage: ad.mainImage,
      secondaryImage: ad.secondaryImage || '',
      backgroundColor: ad.backgroundColor || '#051329',
      gradient: ad.gradient || 'from-blue-950 via-slate-900 to-slate-950',
      textColor: ad.textColor || '#ffffff',
      cta: {
        enabled: ad.cta?.enabled !== false,
        label: ad.cta?.label || 'Shop Now',
        url: ad.cta?.url || '/shop',
        target: ad.cta?.target || '_self',
        variant: ad.cta?.variant || 'primary',
        bgColor: ad.cta?.bgColor || '#2563eb',
        textColor: ad.cta?.textColor || '#ffffff',
      },
      closeButton: {
        enabled: ad.closeButton?.enabled !== false,
        position: ad.closeButton?.position || 'top-right',
        appearance: ad.closeButton?.appearance || 'circle',
        dismissalPolicy: ad.closeButton?.dismissalPolicy || 'session',
        dismissalDurationHours: ad.closeButton?.dismissalDurationHours || 24,
      },
      placements: ad.placements || ['between_sections'],
      deviceTargeting: ad.deviceTargeting || 'all',
      priority: ad.priority || 1,
      status: ad.status || 'published',
      startDate: ad.startDate ? new Date(ad.startDate).toISOString().slice(0, 10) : '',
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().slice(0, 10) : '',
    });
    setIsModalOpen(true);
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.title || !form.mainImage) {
      dispatch(addToast({ type: 'error', title: 'Missing Fields', message: 'Name, Title, and Main Image are required.' }));
      return;
    }

    let res;
    if (editingAd) {
      res = await apiRequest(`/advertisements/${editingAd._id || editingAd.id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
    } else {
      res = await apiRequest('/advertisements', {
        method: 'POST',
        body: JSON.stringify(form),
      });
    }

    if (res.success) {
      setIsModalOpen(false);
      fetchAds();
      dispatch(
        addToast({
          type: 'success',
          title: editingAd ? 'Advertisement Updated' : 'Advertisement Created',
          message: `${form.title} saved to database.`,
        })
      );
    } else {
      dispatch(addToast({ type: 'error', title: 'Failed', message: res.message || 'Could not save advertisement.' }));
    }
  };

  const handleToggleStatus = async (ad: Advertisement) => {
    const nextStatus = ad.status === 'published' ? 'draft' : 'published';
    const res = await apiRequest(`/advertisements/${ad._id || ad.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.success) {
      fetchAds();
      dispatch(
        addToast({
          type: 'success',
          title: 'Status Updated',
          message: `Ad is now ${nextStatus}.`,
        })
      );
    }
  };

  const handleDuplicateAd = async (ad: Advertisement) => {
    const res = await apiRequest(`/advertisements/${ad._id || ad.id}/duplicate`, { method: 'POST' });
    if (res.success) {
      fetchAds();
      dispatch(addToast({ type: 'info', title: 'Ad Duplicated', message: 'Saved as draft copy.' }));
    }
  };

  const handleDeleteAd = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete advertisement "${name}"?`)) return;
    const res = await apiRequest(`/advertisements/${id}`, { method: 'DELETE' });
    if (res.success) {
      fetchAds();
      dispatch(addToast({ type: 'info', title: 'Advertisement Removed', message: `"${name}" was deleted.` }));
    }
  };

  const togglePlacement = (placementId: string) => {
    if (form.placements.includes(placementId)) {
      if (form.placements.length === 1) return; // Keep at least one
      setForm({ ...form, placements: form.placements.filter((p) => p !== placementId) });
    } else {
      setForm({ ...form, placements: [...form.placements, placementId] });
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Advertisement Management System</h2>
            <p className="text-xs text-slate-500">
              Manage promotional campaigns, multi-placement targeting, dismissal policies, and impression tracking.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Advertisement</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Ads</span>
          <p className="text-lg font-black text-slate-900 mt-0.5">{stats.total || ads.length}</p>
        </div>
        <div className="p-3.5 rounded-2xl border border-emerald-100 bg-emerald-50/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Active Published</span>
          <p className="text-lg font-black text-emerald-800 mt-0.5">{stats.active || 0}</p>
        </div>
        <div className="p-3.5 rounded-2xl border border-amber-100 bg-amber-50/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Expired</span>
          <p className="text-lg font-black text-amber-800 mt-0.5">{stats.expired || 0}</p>
        </div>
        <div className="p-3.5 rounded-2xl border border-blue-100 bg-blue-50/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Total Impressions</span>
          <p className="text-lg font-black text-blue-800 mt-0.5">{(stats.totalImpressions || 0).toLocaleString()}</p>
        </div>
        <div className="p-3.5 rounded-2xl border border-purple-100 bg-purple-50/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Total CTA Clicks</span>
          <p className="text-lg font-black text-purple-800 mt-0.5">{(stats.totalClicks || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchAds()}
              placeholder="Search advertisements by title or internal name..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
          <button
            type="button"
            onClick={fetchAds}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={placementFilter}
            onChange={(e) => setPlacementFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">All Placements</option>
            {AVAILABLE_PLACEMENTS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ads Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3">Ad Creative</th>
              <th className="p-3">Placements</th>
              <th className="p-3">Targeting</th>
              <th className="p-3">Impressions / Clicks</th>
              <th className="p-3">CTR</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ads.map((ad) => {
              const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0';
              return (
                <tr key={ad._id || ad.id} className="hover:bg-slate-50/50">
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={ad.mainImage}
                      alt={ad.title}
                      className="w-12 h-12 object-cover rounded-xl bg-slate-900 shrink-0 border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate max-w-xs">{ad.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate max-w-xs">{ad.name}</p>
                      {ad.promoBadge && (
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                          {ad.promoBadge}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {ad.placements.map((p) => (
                        <span key={p} className="text-[9px] font-mono font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {p.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 capitalize font-semibold text-slate-700">
                    {ad.deviceTargeting.replace('_', ' ')}
                  </td>
                  <td className="p-3 font-mono font-semibold text-slate-800">
                    {ad.impressions.toLocaleString()} / <span className="text-blue-600">{ad.clicks.toLocaleString()}</span>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-900">
                    {ctr}%
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(ad)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition ${
                        ad.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${ad.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {ad.status}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicateAd(ad)}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="Duplicate ad"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(ad)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit advertisement"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAd(ad._id || ad.id || '', ad.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete advertisement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal for Creating / Editing Advertisement */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}
        subtitle="Configure advertising creatives, placement eligibility, close button persistence, and CTA links."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveAd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Internal Campaign Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Galaxy S25 Ultra Q1 Push"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Public Headline Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Flagship Galaxy S25 Ultra 5G"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="e.g. Titanium Gray · 12GB RAM · 256GB"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Promotional Badge Tag</label>
              <input
                type="text"
                value={form.promoBadge}
                onChange={(e) => setForm({ ...form, promoBadge: e.target.value })}
                placeholder="e.g. Official Warranty or Limited Stock 🔥"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Copy</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Experience next-gen Galaxy AI, revolutionary 200MP camera resolution..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* Main Image Upload Component */}
          <ImageUploadInput
            label="Main Advertisement Image"
            required
            value={form.mainImage}
            onChange={(url) => setForm({ ...form, mainImage: url })}
            placeholder="https://images.unsplash.com/..."
            helperText="Upload image asset from device or enter URL. Stored permanently."
          />

          {/* Placements Multi-Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Placements (Select one or more)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_PLACEMENTS.map((p) => {
                const isSelected = form.placements.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlacement(p.id)}
                    className={`p-2 rounded-xl text-xs font-medium text-left border transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{p.label}</span>
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                      {isSelected && '✓'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA Button Settings */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">CTA Button Configuration</span>
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.cta.enabled}
                  onChange={(e) => setForm({ ...form, cta: { ...form.cta, enabled: e.target.checked } })}
                  className="rounded text-blue-600"
                />
                <span>Enable CTA Button</span>
              </label>
            </div>

            {form.cta.enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Button Label</label>
                  <input
                    type="text"
                    value={form.cta.label}
                    onChange={(e) => setForm({ ...form, cta: { ...form.cta, label: e.target.value } })}
                    placeholder="Shop Now"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Destination URL</label>
                  <input
                    type="text"
                    value={form.cta.url}
                    onChange={(e) => setForm({ ...form, cta: { ...form.cta, url: e.target.value } })}
                    placeholder="/product/samsung-galaxy-s25-ultra"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Window</label>
                  <select
                    value={form.cta.target}
                    onChange={(e) => setForm({ ...form, cta: { ...form.cta, target: e.target.value as any } })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="_self">Same Tab (_self)</option>
                    <option value="_blank">New Tab (_blank)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Close Button & Dismissal Policy */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Close Button & Dismissal Policy</span>
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.closeButton.enabled}
                  onChange={(e) =>
                    setForm({ ...form, closeButton: { ...form.closeButton, enabled: e.target.checked } })
                  }
                  className="rounded text-blue-600"
                />
                <span>Allow User Dismissal</span>
              </label>
            </div>

            {form.closeButton.enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dismissal Policy</label>
                  <select
                    value={form.closeButton.dismissalPolicy}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        closeButton: { ...form.closeButton, dismissalPolicy: e.target.value as any },
                      })
                    }
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="session">Current Browser Session (Recommended)</option>
                    <option value="duration">Fixed Duration (Hours)</option>
                    <option value="until_reload">Until Page Reload (Transient)</option>
                    <option value="until_expiration">Until Ad Expires</option>
                  </select>
                </div>
                {form.closeButton.dismissalPolicy === 'duration' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Hide Duration (Hours)</label>
                    <input
                      type="number"
                      min="1"
                      value={form.closeButton.dismissalDurationHours}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          closeButton: {
                            ...form.closeButton,
                            dismissalDurationHours: Number(e.target.value) || 24,
                          },
                        })
                      }
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Close Button Style</label>
                  <select
                    value={form.closeButton.appearance}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        closeButton: { ...form.closeButton, appearance: e.target.value as any },
                      })
                    }
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="circle">Circular Translucent</option>
                    <option value="pill">Pill with text</option>
                    <option value="minimal">Minimal Icon</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Targeting & Scheduling */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Device Targeting</label>
              <select
                value={form.deviceTargeting}
                onChange={(e) => setForm({ ...form, deviceTargeting: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="all">All Devices</option>
                <option value="desktop_only">Desktop Only</option>
                <option value="mobile_only">Mobile Only</option>
                <option value="tablet_only">Tablet Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <input
                type="number"
                min="1"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: Number(e.target.value) || 1 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
              className="p-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold"
            >
              <option value="published">Published & Active</option>
              <option value="draft">Save as Draft</option>
              <option value="archived">Archived</option>
            </select>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/30 transition cursor-pointer"
              >
                Save Advertisement
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
