import React, { useState } from 'react';
import { DynamicBanner, BannerLayer, BannerButton, BackgroundType } from '../../../types';
import {
  ArrowLeft,
  Save,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Layers as LayersIcon,
  Palette,
  Layout,
  MousePointer,
  Calendar,
  Sparkles,
  ArrowRight,
  ExternalLink,
  RotateCw,
  Check,
} from 'lucide-react';
import { ImageUploadInput } from '../../common/ImageUploadInput';
import { PublicDynamicBanner } from '../../public/PublicDynamicBanner';

interface DynamicBannerBuilderProps {
  initialBanner?: DynamicBanner | null;
  onSave: (bannerData: Partial<DynamicBanner>) => Promise<void>;
  onCancel: () => void;
}

const DEFAULT_BANNER: DynamicBanner = {
  name: 'New Promotional Campaign Banner',
  slug: `banner-${Date.now().toString().slice(-6)}`,
  status: 'published',
  placements: ['mid_banner'],
  priority: 1,
  background: {
    type: 'combined',
    color: '#001736',
    opacity: 100,
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80',
    imagePosition: 'center',
    imageSize: 'cover',
    imageRepeat: 'no-repeat',
    overlayColor: '#001128',
    overlayOpacity: 70,
    gradient: {
      type: 'linear',
      angle: 90,
      direction: 'to right',
      stops: [
        { color: '#001736', stop: 0 },
        { color: '#002f6c', stop: 100 },
      ],
      opacity: 95,
    },
  },
  layout: {
    width: '100%',
    height: 'auto',
    minHeight: '320px',
    padding: { top: 36, right: 36, bottom: 36, left: 36 },
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    contentAlign: 'left',
    verticalAlign: 'center',
    containerWidth: '60%',
  },
  layers: [
    {
      id: 'layer-1',
      type: 'badge',
      text: 'LIMITED TIME PROMOTION ⚡',
      fontSize: 11,
      fontWeight: '800',
      textColor: '#93c5fd',
      textAlign: 'left',
      opacity: 100,
      zIndex: 2,
      isVisible: true,
      position: { x: 0, y: 0, mode: 'flow' },
    },
    {
      id: 'layer-2',
      type: 'heading',
      text: 'Next-Gen Flagship Audio & Tech',
      fontSize: 32,
      fontWeight: '900',
      textColor: '#ffffff',
      textAlign: 'left',
      opacity: 100,
      zIndex: 2,
      isVisible: true,
      position: { x: 0, y: 0, mode: 'flow' },
    },
    {
      id: 'layer-3',
      type: 'description',
      text: 'Upgrade your daily workflow with authentic brand gear and ultra-fast nationwide delivery.',
      fontSize: 13,
      fontWeight: '400',
      textColor: '#cbd5e1',
      textAlign: 'left',
      opacity: 95,
      zIndex: 2,
      isVisible: true,
      position: { x: 0, y: 0, mode: 'flow' },
    },
  ],
  buttons: [
    {
      id: 'btn-1',
      label: 'Explore Catalog',
      url: '/shop',
      target: '_self',
      variant: 'primary',
      bgColor: '#2563eb',
      textColor: '#ffffff',
      borderRadius: 9999,
      paddingX: 22,
      paddingY: 11,
      fontSize: 13,
      fontWeight: '700',
      hoverAnimation: 'scale',
      icon: 'ArrowRight',
      iconPosition: 'right',
      isVisible: true,
    },
  ],
  responsive: {
    tablet: { minHeight: '280px', paddingScale: 0.8, fontScale: 0.9 },
    mobile: { minHeight: '240px', paddingScale: 0.6, fontScale: 0.8, stackButtons: true },
  },
};

const COLOR_PRESETS = [
  '#001736',
  '#002f6c',
  '#1d4ed8',
  '#0284c7',
  '#0f172a',
  '#1e1b4b',
  '#4c1d95',
  '#831843',
  '#064e3b',
  '#78350f',
  '#000000',
  '#ffffff',
];

const GRADIENT_PRESETS = [
  { name: 'Midnight Deep', angle: 90, stops: [{ color: '#001736', stop: 0 }, { color: '#002f6c', stop: 100 }] },
  { name: 'Electric Cyan', angle: 90, stops: [{ color: '#0284c7', stop: 0 }, { color: '#06b6d4', stop: 100 }] },
  { name: 'Royal Indigo', angle: 135, stops: [{ color: '#312e81', stop: 0 }, { color: '#4338ca', stop: 100 }] },
  { name: 'Sunset Crimson', angle: 90, stops: [{ color: '#831843', stop: 0 }, { color: '#e11d48', stop: 100 }] },
  { name: 'Emerald Peak', angle: 90, stops: [{ color: '#064e3b', stop: 0 }, { color: '#059669', stop: 100 }] },
];

export const DynamicBannerBuilder: React.FC<DynamicBannerBuilderProps> = ({
  initialBanner,
  onSave,
  onCancel,
}) => {
  const [banner, setBanner] = useState<DynamicBanner>(initialBanner || DEFAULT_BANNER);
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'layers' | 'buttons' | 'background' | 'layout' | 'settings'>('layers');
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(banner.layers[0]?.id || null);
  const [selectedButtonId, setSelectedButtonId] = useState<string | null>(banner.buttons[0]?.id || null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedLayer = banner.layers.find((l) => l.id === selectedLayerId) || null;
  const selectedButton = banner.buttons.find((b) => b.id === selectedButtonId) || null;

  const handleUpdateLayer = (id: string, updates: Partial<BannerLayer>) => {
    setBanner((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
  };

  const handleAddLayer = (type: BannerLayer['type']) => {
    const newId = `layer-${Date.now()}`;
    let newLayer: BannerLayer = {
      id: newId,
      type,
      text: type === 'badge' ? 'PROMO' : type === 'heading' ? 'New Heading' : 'Supporting description text',
      fontSize: type === 'badge' ? 11 : type === 'heading' ? 28 : 13,
      fontWeight: type === 'badge' ? '800' : type === 'heading' ? '900' : '400',
      textColor: '#ffffff',
      textAlign: 'left',
      opacity: 100,
      zIndex: banner.layers.length + 1,
      isVisible: true,
      position: { x: 0, y: 0, mode: 'flow' },
    };

    setBanner((prev) => ({
      ...prev,
      layers: [...prev.layers, newLayer],
    }));
    setSelectedLayerId(newId);
  };

  const handleDeleteLayer = (id: string) => {
    setBanner((prev) => ({
      ...prev,
      layers: prev.layers.filter((l) => l.id !== id),
    }));
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
  };

  const handleMoveLayer = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === banner.layers.length - 1)) {
      return;
    }
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const newLayers = [...banner.layers];
    const temp = newLayers[index];
    newLayers[index] = newLayers[targetIdx];
    newLayers[targetIdx] = temp;
    setBanner((prev) => ({ ...prev, layers: newLayers }));
  };

  const handleAddButton = () => {
    const newId = `btn-${Date.now()}`;
    const newBtn: BannerButton = {
      id: newId,
      label: 'New CTA',
      url: '/shop',
      target: '_self',
      variant: 'primary',
      bgColor: '#2563eb',
      textColor: '#ffffff',
      borderRadius: 9999,
      paddingX: 20,
      paddingY: 10,
      fontSize: 12,
      fontWeight: '700',
      hoverAnimation: 'scale',
      icon: 'ArrowRight',
      iconPosition: 'right',
      isVisible: true,
    };
    setBanner((prev) => ({ ...prev, buttons: [...prev.buttons, newBtn] }));
    setSelectedButtonId(newId);
  };

  const handleUpdateBtn = (id: string, updates: Partial<BannerButton>) => {
    setBanner((prev) => ({
      ...prev,
      buttons: prev.buttons.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
  };

  const handleDeleteBtn = (id: string) => {
    setBanner((prev) => ({
      ...prev,
      buttons: prev.buttons.filter((b) => b.id !== id),
    }));
    if (selectedButtonId === id) {
      setSelectedButtonId(null);
    }
  };

  const handleSubmitSave = async () => {
    setIsSaving(true);
    try {
      await onSave(banner);
    } finally {
      setIsSaving(false);
    }
  };

  // Preview container max-width based on device switcher
  const getDeviceWidthStyle = () => {
    if (devicePreview === 'mobile') return 'max-w-[375px]';
    if (devicePreview === 'tablet') return 'max-w-[768px]';
    return 'max-w-5xl w-full';
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col font-sans -m-4 sm:-m-8">
      {/* Top Builder Navigation Toolbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition"
            title="Return to Banners list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={banner.name}
                onChange={(e) => setBanner({ ...banner, name: e.target.value })}
                className="font-bold text-sm text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-white border-b border-transparent hover:border-slate-300 focus:border-blue-500 px-1 py-0.5 rounded outline-hidden transition"
                placeholder="Banner Name..."
              />
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                {banner.status}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Slug: {banner.slug}</p>
          </div>
        </div>

        {/* Device Preview Switcher (Phase 3) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setDevicePreview('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              devicePreview === 'desktop' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setDevicePreview('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              devicePreview === 'tablet' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet (768px)</span>
          </button>
          <button
            type="button"
            onClick={() => setDevicePreview('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              devicePreview === 'mobile' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile (375px)</span>
          </button>
        </div>

        {/* Save and Status Actions */}
        <div className="flex items-center gap-2">
          <select
            value={banner.status}
            onChange={(e) => setBanner({ ...banner, status: e.target.value as any })}
            className="p-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <button
            type="button"
            onClick={handleSubmitSave}
            disabled={isSaving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Banner'}</span>
          </button>
        </div>
      </header>

      {/* 3-Panel Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Control Toolbox */}
        <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
          {/* Tab Selection */}
          <div className="flex border-b border-slate-200 bg-slate-50/50 p-1 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('layers')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition ${
                activeTab === 'layers' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayersIcon className="w-3.5 h-3.5" />
              <span>Layers</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('buttons')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition ${
                activeTab === 'buttons' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>CTA Buttons</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('background')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition ${
                activeTab === 'background' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Background</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('layout')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition ${
                activeTab === 'layout' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Layout</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 1. LAYERS TAB */}
            {activeTab === 'layers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Layers Stack</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleAddLayer('badge')}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-md"
                    >
                      + Badge
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddLayer('heading')}
                      className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md"
                    >
                      + Heading
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddLayer('description')}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-md"
                    >
                      + Text
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {banner.layers.map((layer, index) => {
                    const isSelected = layer.id === selectedLayerId;
                    return (
                      <div
                        key={layer.id}
                        onClick={() => setSelectedLayerId(layer.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 font-mono">
                            {layer.type}
                          </span>
                          <span className="truncate max-w-[140px] font-semibold">{layer.text || '(empty)'}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveLayer(index, 'up');
                            }}
                            disabled={index === 0}
                            className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                          >
                            <MoveUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveLayer(index, 'down');
                            }}
                            disabled={index === banner.layers.length - 1}
                            className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                          >
                            <MoveDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLayer(layer.id);
                            }}
                            className="p-1 hover:bg-rose-100 rounded text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. BUTTONS TAB */}
            {activeTab === 'buttons' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">CTA Buttons</span>
                  <button
                    type="button"
                    onClick={handleAddButton}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Button</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {banner.buttons.map((btn) => {
                    const isSelected = btn.id === selectedButtonId;
                    return (
                      <div
                        key={btn.id}
                        onClick={() => setSelectedButtonId(btn.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: btn.bgColor }}
                          />
                          <span className="font-bold">{btn.label}</span>
                          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[90px]">{btn.url}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBtn(btn.id);
                          }}
                          className="p-1 hover:bg-rose-100 rounded text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. BACKGROUND TAB (Solid, Image, Gradient, Combined) */}
            {activeTab === 'background' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Background Type</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['combined', 'gradient', 'image', 'solid'] as BackgroundType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setBanner({ ...banner, background: { ...banner.background, type } })}
                        className={`py-2 px-3 rounded-xl font-bold uppercase text-[10px] tracking-wider border transition ${
                          banner.background.type === type
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Solid Color / Base Color */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Base / Solid Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={banner.background.color}
                      onChange={(e) =>
                        setBanner({ ...banner, background: { ...banner.background, color: e.target.value } })
                      }
                      className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={banner.background.color}
                      onChange={(e) =>
                        setBanner({ ...banner, background: { ...banner.background, color: e.target.value } })
                      }
                      className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                    />
                  </div>
                  {/* Presets */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setBanner({ ...banner, background: { ...banner.background, color } })}
                        className="w-5 h-5 rounded-md border border-slate-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Image Upload if 'image' or 'combined' */}
                {(banner.background.type === 'image' || banner.background.type === 'combined') && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <ImageUploadInput
                      label="Background Image Asset"
                      value={banner.background.imageUrl || ''}
                      onChange={(url) =>
                        setBanner({ ...banner, background: { ...banner.background, imageUrl: url } })
                      }
                      placeholder="https://images.unsplash.com/..."
                      helperText="High-res desktop background asset."
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Position</label>
                        <select
                          value={banner.background.imagePosition || 'center'}
                          onChange={(e) =>
                            setBanner({ ...banner, background: { ...banner.background, imagePosition: e.target.value } })
                          }
                          className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        >
                          <option value="center">Center</option>
                          <option value="center right">Center Right</option>
                          <option value="center left">Center Left</option>
                          <option value="top">Top</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Sizing</label>
                        <select
                          value={banner.background.imageSize || 'cover'}
                          onChange={(e) =>
                            setBanner({ ...banner, background: { ...banner.background, imageSize: e.target.value as any } })
                          }
                          className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        >
                          <option value="cover">Cover (Fill)</option>
                          <option value="contain">Contain</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>
                    </div>

                    {/* Overlay Opacity */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="font-bold text-slate-600">Image Dark Overlay</span>
                        <span className="font-mono text-slate-400">{banner.background.overlayOpacity ?? 40}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={banner.background.overlayOpacity ?? 40}
                        onChange={(e) =>
                          setBanner({
                            ...banner,
                            background: { ...banner.background, overlayOpacity: Number(e.target.value) },
                          })
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                {/* Gradient Customization if 'gradient' or 'combined' */}
                {(banner.background.type === 'gradient' || banner.background.type === 'combined') && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 block">Gradient Palette & Angle</span>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Start Color</label>
                        <input
                          type="color"
                          value={banner.background.gradient?.stops?.[0]?.color || '#001736'}
                          onChange={(e) => {
                            const stops = [...(banner.background.gradient?.stops || [{ color: '#001736', stop: 0 }, { color: '#002f6c', stop: 100 }])];
                            stops[0] = { color: e.target.value, stop: stops[0]?.stop || 0 };
                            setBanner({ ...banner, background: { ...banner.background, gradient: { ...banner.background.gradient!, stops } } });
                          }}
                          className="w-full h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">End Color</label>
                        <input
                          type="color"
                          value={banner.background.gradient?.stops?.[1]?.color || '#002f6c'}
                          onChange={(e) => {
                            const stops = [...(banner.background.gradient?.stops || [{ color: '#001736', stop: 0 }, { color: '#002f6c', stop: 100 }])];
                            stops[1] = { color: e.target.value, stop: stops[1]?.stop || 100 };
                            setBanner({ ...banner, background: { ...banner.background, gradient: { ...banner.background.gradient!, stops } } });
                          }}
                          className="w-full h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="font-bold text-slate-600">Angle</span>
                        <span className="font-mono text-slate-400">{banner.background.gradient?.angle || 90}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={banner.background.gradient?.angle || 90}
                        onChange={(e) =>
                          setBanner({
                            ...banner,
                            background: {
                              ...banner.background,
                              gradient: { ...banner.background.gradient!, angle: Number(e.target.value) },
                            },
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Gradient presets */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Gradient Presets</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {GRADIENT_PRESETS.map((gp) => (
                          <button
                            key={gp.name}
                            type="button"
                            onClick={() =>
                              setBanner({
                                ...banner,
                                background: {
                                  ...banner.background,
                                  gradient: {
                                    type: 'linear',
                                    angle: gp.angle,
                                    direction: 'to right',
                                    stops: gp.stops,
                                    opacity: 95,
                                  },
                                },
                              })
                            }
                            className="p-1.5 rounded-lg border border-slate-200 text-[10px] font-semibold text-slate-700 hover:border-blue-400 text-left truncate"
                          >
                            {gp.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. LAYOUT TAB */}
            {activeTab === 'layout' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Minimum Height</label>
                  <input
                    type="text"
                    value={banner.layout.minHeight}
                    onChange={(e) => setBanner({ ...banner, layout: { ...banner.layout, minHeight: e.target.value } })}
                    placeholder="320px"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Border Radius (px)</label>
                  <input
                    type="number"
                    value={banner.layout.borderRadius}
                    onChange={(e) =>
                      setBanner({ ...banner, layout: { ...banner.layout, borderRadius: Number(e.target.value) } })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Content Align</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => setBanner({ ...banner, layout: { ...banner.layout, contentAlign: align } })}
                        className={`py-1.5 rounded-lg text-xs font-bold capitalize border ${
                          banner.layout.contentAlign === align
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Content Container Width</label>
                  <input
                    type="text"
                    value={banner.layout.containerWidth}
                    onChange={(e) =>
                      setBanner({ ...banner, layout: { ...banner.layout, containerWidth: e.target.value } })
                    }
                    placeholder="60% or 600px"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Center Live Canvas Workspace */}
        <main className="flex-1 bg-slate-100/70 p-6 flex flex-col items-center justify-center overflow-auto">
          <div className="w-full flex items-center justify-between mb-4 max-w-5xl">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-blue-600" />
              Live Interactive Canvas Preview ({devicePreview.toUpperCase()})
            </span>
            <span className="text-[11px] text-slate-400">
              Click elements in preview or edit properties in inspector panel.
            </span>
          </div>

          <div className={`transition-all duration-300 w-full ${getDeviceWidthStyle()}`}>
            <PublicDynamicBanner banner={banner} className="transition-all shadow-2xl" />
          </div>
        </main>

        {/* Right Inspector Panel */}
        <aside className="w-80 bg-white border-l border-slate-200 p-4 shrink-0 overflow-y-auto space-y-4">
          {activeTab === 'layers' && selectedLayer ? (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 uppercase text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Layer Inspector
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                  {selectedLayer.type}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Text Content</label>
                <textarea
                  rows={3}
                  value={selectedLayer.text || ''}
                  onChange={(e) => handleUpdateLayer(selectedLayer.id, { text: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Font Size (px)</label>
                  <input
                    type="number"
                    min="9"
                    max="80"
                    value={selectedLayer.fontSize}
                    onChange={(e) =>
                      handleUpdateLayer(selectedLayer.id, { fontSize: Number(e.target.value) || 16 })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Font Weight</label>
                  <select
                    value={selectedLayer.fontWeight}
                    onChange={(e) => handleUpdateLayer(selectedLayer.id, { fontWeight: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="400">Regular (400)</option>
                    <option value="600">SemiBold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">ExtraBold (800)</option>
                    <option value="900">Black (900)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedLayer.textColor}
                    onChange={(e) => handleUpdateLayer(selectedLayer.id, { textColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedLayer.textColor}
                    onChange={(e) => handleUpdateLayer(selectedLayer.id, { textColor: e.target.value })}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-700">Opacity</span>
                  <span className="font-mono text-slate-400">{selectedLayer.opacity ?? 100}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={selectedLayer.opacity ?? 100}
                  onChange={(e) => handleUpdateLayer(selectedLayer.id, { opacity: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedLayer.isVisible !== false}
                    onChange={(e) => handleUpdateLayer(selectedLayer.id, { isVisible: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Layer Visible</span>
                </label>
              </div>
            </div>
          ) : activeTab === 'buttons' && selectedButton ? (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 uppercase text-[11px]">CTA Button Inspector</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Button Label</label>
                <input
                  type="text"
                  value={selectedButton.label}
                  onChange={(e) => handleUpdateBtn(selectedButton.id, { label: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Destination URL</label>
                <input
                  type="text"
                  value={selectedButton.url}
                  onChange={(e) => handleUpdateBtn(selectedButton.id, { url: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  placeholder="/shop?category=electronics"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Background Color</label>
                  <input
                    type="color"
                    value={selectedButton.bgColor}
                    onChange={(e) => handleUpdateBtn(selectedButton.id, { bgColor: e.target.value })}
                    className="w-full h-8 rounded-lg border border-slate-200 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Text Color</label>
                  <input
                    type="color"
                    value={selectedButton.textColor}
                    onChange={(e) => handleUpdateBtn(selectedButton.id, { textColor: e.target.value })}
                    className="w-full h-8 rounded-lg border border-slate-200 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Icon</label>
                  <select
                    value={selectedButton.icon || 'ArrowRight'}
                    onChange={(e) => handleUpdateBtn(selectedButton.id, { icon: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="ArrowRight">Arrow Right</option>
                    <option value="ShoppingCart">Shopping Cart</option>
                    <option value="Sparkles">Sparkles</option>
                    <option value="ExternalLink">External Link</option>
                    <option value="Zap">Zap (Lightning)</option>
                    <option value="Star">Star</option>
                    <option value="Tag">Tag</option>
                    <option value="">None</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Window</label>
                  <select
                    value={selectedButton.target}
                    onChange={(e) => handleUpdateBtn(selectedButton.id, { target: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="_self">Same Tab (_self)</option>
                    <option value="_blank">New Tab (_blank)</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 space-y-2">
              <MousePointer className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">Select an element to inspect its properties.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
