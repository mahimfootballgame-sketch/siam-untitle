import React, { useState, useEffect } from 'react';
import { DynamicBanner } from '../../types';
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Search,
  Filter,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { DynamicBannerBuilder } from './banners/DynamicBannerBuilder';
import { PublicDynamicBanner } from '../public/PublicDynamicBanner';
import { apiRequest } from '../../services/api';
import { useAppDispatch } from '../../app/hooks';
import { addToast } from '../../features/ui/uiSlice';

interface BannersManagerProps {
  banners?: any[];
  onRefresh?: () => void;
}

const AVAILABLE_PLACEMENTS = [
  { id: 'split_left', label: 'Split Left (Summer Sale)' },
  { id: 'split_right', label: 'Split Right (Next-Gen Tech)' },
  { id: 'mid_banner', label: 'Mid-Page Feature (Live Smarter)' },
  { id: 'home_hero_banner', label: 'Homepage Secondary Hero' },
  { id: 'plp_banner', label: 'Product Listing Top Banner' },
  { id: 'pdp_banner', label: 'Product Detail Promo Banner' },
  { id: 'sponsored', label: 'Sponsored Section' },
];

export const BannersManager: React.FC<BannersManagerProps> = ({ onRefresh }) => {
  const dispatch = useAppDispatch();
  const [banners, setBanners] = useState<DynamicBanner[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, published: 0, draft: 0, scheduled: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [placementFilter, setPlacementFilter] = useState('all');

  // Builder mode: null means listing view, otherwise editing/creating in visual builder
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<DynamicBanner | null>(null);

  const fetchBanners = async () => {
    setIsLoading(true);
    const query = new URLSearchParams();
    if (searchQuery) query.set('search', searchQuery);
    if (statusFilter !== 'all') query.set('status', statusFilter);
    if (placementFilter !== 'all') query.set('placement', placementFilter);

    const res = await apiRequest(`/banners?${query.toString()}`);
    setIsLoading(false);
    if (res.success && res.banners) {
      setBanners(res.banners);
      if (res.stats) setStats(res.stats);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [statusFilter, placementFilter]);

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setIsBuilderOpen(true);
  };

  const handleOpenEdit = (b: DynamicBanner) => {
    setEditingBanner(b);
    setIsBuilderOpen(true);
  };

  const handleSaveBanner = async (bannerData: Partial<DynamicBanner>) => {
    let res;
    if (editingBanner) {
      res = await apiRequest(`/banners/${editingBanner._id || editingBanner.id}`, {
        method: 'PUT',
        body: JSON.stringify(bannerData),
      });
    } else {
      res = await apiRequest('/banners', {
        method: 'POST',
        body: JSON.stringify(bannerData),
      });
    }

    if (res.success) {
      setIsBuilderOpen(false);
      setEditingBanner(null);
      fetchBanners();
      if (onRefresh) onRefresh();
      dispatch(
        addToast({
          type: 'success',
          title: editingBanner ? 'Banner Saved' : 'Banner Created',
          message: 'Changes are live and persisted in the database.',
        })
      );
    } else {
      dispatch(addToast({ type: 'error', title: 'Save Failed', message: res.message || 'Could not save banner.' }));
    }
  };

  const handleToggleStatus = async (banner: DynamicBanner) => {
    const nextStatus = banner.status === 'published' ? 'draft' : 'published';
    const res = await apiRequest(`/banners/${banner._id || banner.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.success) {
      fetchBanners();
      if (onRefresh) onRefresh();
      dispatch(
        addToast({
          type: 'success',
          title: 'Status Updated',
          message: `Banner set to ${nextStatus}.`,
        })
      );
    }
  };

  const handleDuplicate = async (banner: DynamicBanner) => {
    const res = await apiRequest(`/banners/${banner._id || banner.id}/duplicate`, { method: 'POST' });
    if (res.success) {
      fetchBanners();
      if (onRefresh) onRefresh();
      dispatch(addToast({ type: 'info', title: 'Banner Duplicated', message: 'Duplicated as draft copy.' }));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete banner "${name}"?`)) return;
    const res = await apiRequest(`/banners/${id}`, { method: 'DELETE' });
    if (res.success) {
      fetchBanners();
      if (onRefresh) onRefresh();
      dispatch(addToast({ type: 'info', title: 'Banner Deleted', message: `"${name}" removed.` }));
    }
  };

  // If builder mode is active, render the visual DynamicBannerBuilder
  if (isBuilderOpen) {
    return (
      <DynamicBannerBuilder
        initialBanner={editingBanner}
        onSave={handleSaveBanner}
        onCancel={() => {
          setIsBuilderOpen(false);
          setEditingBanner(null);
        }}
      />
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Dynamic Banner Builder & Manager</h2>
            <p className="text-xs text-slate-500">
              Create and customize high-converting promotional banners with advanced backgrounds, gradients, layers, and CTAs.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Open Banner Builder</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Banners</span>
          <p className="text-lg font-black text-slate-900 mt-0.5">{stats.total || banners.length}</p>
        </div>
        <div className="p-3.5 rounded-2xl border border-emerald-100 bg-emerald-50/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Published Live</span>
          <p className="text-lg font-black text-emerald-800 mt-0.5">{stats.published || 0}</p>
        </div>
        <div className="p-3.5 rounded-2xl border border-amber-100 bg-amber-50/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Drafts</span>
          <p className="text-lg font-black text-amber-800 mt-0.5">{stats.draft || 0}</p>
        </div>
        <div className="p-3.5 rounded-2xl border border-blue-100 bg-blue-50/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Scheduled</span>
          <p className="text-lg font-black text-blue-800 mt-0.5">{stats.scheduled || 0}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchBanners()}
              placeholder="Search banners by name or slug..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
          <button
            type="button"
            onClick={fetchBanners}
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

      {/* Banners Cards Grid with Real Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {banners.map((b) => {
          return (
            <div
              key={b._id || b.id}
              className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              {/* Visual Preview */}
              <div className="p-3 bg-slate-100/60 border-b border-slate-100">
                <PublicDynamicBanner banner={b} className="scale-95 origin-top pointer-events-none" />
              </div>

              {/* Banner Details & Action Controls */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{b.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">Slug: {b.slug}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(b)}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition ${
                      b.status === 'published'
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {b.status}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">Placements:</span>
                    {b.placements.map((p) => (
                      <span key={p} className="text-[9px] font-mono font-bold bg-slate-100 px-1.5 py-0.2 rounded">
                        {p}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(b)}
                      className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                      title="Duplicate banner"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit banner in builder"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(b._id || b.id || '', b.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete banner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
