'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Product, Stats, ValidationLog, Category } from '@/types/product';
import { getProducts, getCategories, updateProduct, approveProduct, triggerSync, triggerTaobaoSync, getSettings, saveSettings } from '@/lib/api';
import { formatUZS, resolveImageUrl } from '@/lib/utils';
import { Settings, RefreshCw, AlertTriangle, CheckCircle, Clock, Image as ImageIcon, Zap, ShoppingBag, Edit3, X, Check } from 'lucide-react';

interface AdminDashboardProps {
  stats: Stats | null;
  refreshStats: () => void;
}

export default function AdminDashboard({ stats, refreshStats }: AdminDashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productLogs, setProductLogs] = useState<ValidationLog[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'failed' | 'pending' | 'approved' | 'rasm_xatosi'>('failed');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingDaily, setIsSyncingDaily] = useState(false);
  const [isSyncingTaobao, setIsSyncingTaobao] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [exchangeRate, setExchangeRate] = useState('1820');
  const [markupPercent, setMarkupPercent] = useState('25');

  // Edit form state
  const [editNameUz, setEditNameUz] = useState('');
  const [editDescUz, setEditDescUz] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPriceCny, setEditPriceCny] = useState('');
  const [editMoq, setEditMoq] = useState('');
  const [editStockStatus, setEditStockStatus] = useState<'instock' | 'outofstock'>('instock');

  const loadProducts = useCallback(async () => {
    try {
      const data = await getProducts({
        status: activeSubTab,
        search: searchTerm,
        page: currentPage,
        limit: 10,
      });
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
    } catch (e) {
      console.error('Error loading products:', e);
    }
  }, [activeSubTab, searchTerm, currentPage]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const selectProductForEditing = (p: Product) => {
    setSelectedProduct(p);
    setEditNameUz(p.name_uz || '');
    setEditDescUz(p.description_uz || '');
    setEditCategory(p.category || '');
    setEditPriceCny(String(p.price_cny || 0));
    setEditMoq(String(p.moq || 1));
    setEditStockStatus(p.stock_status || 'instock');
  };

  const handleSaveAndValidate = async () => {
    if (!selectedProduct) return;
    setIsSaving(true);
    try {
      const res = await updateProduct(selectedProduct.id, {
        name_uz: editNameUz,
        description_uz: editDescUz,
        category: editCategory,
        price_cny: parseFloat(editPriceCny),
        moq: parseInt(editMoq, 10),
        stock_status: editStockStatus,
      });

      if (res.success) {
        if (res.errors && res.errors.length > 0) {
          alert(`Saqlandi, lekin tekshiruvdan o'tolmadi:\n\n${res.errors.join('\n')}`);
        } else {
          alert("Ajoyib! Mahsulot tekshiruvdan o'tdi va katalogga qo'shildi.");
          setSelectedProduct(null);
        }
        loadProducts();
        refreshStats();
      }
    } catch (e) {
      alert("Xatolik yuz berdi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualApprove = async () => {
    if (!selectedProduct) return;
    if (confirm("Ushbu mahsulotni majburiy tasdiqlashni xohlaysizmi?")) {
      try {
        const res = await approveProduct(selectedProduct.id);
        if (res.success) {
          alert("Mahsulot majburiy ravishda tasdiqlandi!");
          setSelectedProduct(null);
          loadProducts();
          refreshStats();
        }
      } catch (e) {
        alert("Xatolik yuz berdi");
      }
    }
  };

  const handleTaobaoSync = async () => {
    setIsSyncingTaobao(true);
    try {
      const res = await triggerTaobaoSync();
      if (res.success) {
        alert(`Taobao sinxronizatsiyasi yakunlandi!`);
        loadProducts();
        refreshStats();
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setIsSyncingTaobao(false);
    }
  };

  const openSettingsModal = async () => {
    try {
      const data = await getSettings();
      setExchangeRate(data.EXCHANGE_RATE || '1820');
      setMarkupPercent(String(parseFloat(data.MARKUP_PERCENTAGE || '0.25') * 100));
      setShowSettings(true);
    } catch (e) {
      console.error(e);
    }
  };

  const saveSettingsModal = async () => {
    try {
      await saveSettings({
        EXCHANGE_RATE: exchangeRate,
        MARKUP_PERCENTAGE: String(parseFloat(markupPercent) / 100),
      });
      alert('Sozlamalar saqlandi!');
      setShowSettings(false);
      refreshStats();
    } catch (e) {
      alert('Sozlamalarni saqlashda xatolik');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-6">
      {/* Product List Panel */}
      <div className={`${selectedProduct ? 'lg:col-span-2' : 'lg:col-span-3'} bg-[#151c2c]/80 border border-white/10 rounded-3xl p-6 shadow-xl`}>
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Tizim Integratsiyasi & Nazorati</h2>
            <p className="text-xs text-slate-400">Taobao / 1688 aggregator va backend sinxronizatsiyasi</p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={openSettingsModal}
              className="py-2 px-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs font-semibold hover:bg-white/10 flex items-center gap-1.5 transition-colors"
            >
              <Settings className="w-4 h-4 text-cyan-400" />
              Sozlamalar
            </button>

            <button
              onClick={handleTaobaoSync}
              disabled={isSyncingTaobao}
              className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" />
              Taobao API Sinxronizatsiyasi
            </button>
          </div>
        </div>

        <div className="h-px bg-white/10 mb-6"></div>

        {/* Status Sub-tabs & Search */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/10 gap-1 flex-wrap">
            <button
              onClick={() => { setActiveSubTab('failed'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeSubTab === 'failed' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Xatosi Borlar ({stats?.failed || 0})
            </button>
            <button
              onClick={() => { setActiveSubTab('pending'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeSubTab === 'pending' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Kutilmoqda ({stats?.pending || 0})
            </button>
            <button
              onClick={() => { setActiveSubTab('approved'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeSubTab === 'approved' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Tasdiqlangan ({stats?.approved || 0})
            </button>
            <button
              onClick={() => { setActiveSubTab('rasm_xatosi'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeSubTab === 'rasm_xatosi' ? 'bg-pink-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Rasm Xatosi ({stats?.rasm_xatosi || 0})
            </button>
          </div>

          <input
            type="text"
            placeholder="Qidiruv (Nom yoki Taobao ID)..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="py-1.5 px-3.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs outline-none focus:border-cyan-400 w-full sm:w-60"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Rasm</th>
                <th className="p-3">Taobao ID</th>
                <th className="p-3">Mahsulot nomi</th>
                <th className="p-3">CNY (¥)</th>
                <th className="p-3">UZS (so'm)</th>
                <th className="p-3">Harakat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 font-medium">
                    Ushbu status bo'yicha mahsulot topilmadi
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => selectProductForEditing(p)}
                    className={`hover:bg-white/5 transition-colors cursor-pointer ${
                      selectedProduct?.id === p.id ? 'bg-cyan-500/10' : ''
                    }`}
                  >
                    <td className="p-3">
                      <img
                        src={resolveImageUrl(p.main_image || (p.images && p.images[0]))}
                        alt=""
                        className="w-10 h-10 object-cover rounded-lg bg-slate-900"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="100%" height="100%" fill="%23151522"/></svg>';
                        }}
                      />
                    </td>
                    <td className="p-3 font-mono text-cyan-400 font-semibold">{p.source_id}</td>
                    <td className="p-3 max-w-xs truncate font-medium text-slate-200">
                      {p.name_uz || p.name_original}
                    </td>
                    <td className="p-3 text-amber-400 font-bold">{p.price_cny} ¥</td>
                    <td className="p-3 font-bold text-emerald-400">{formatUZS(p.price_uzs)}</td>
                    <td className="p-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectProductForEditing(p);
                        }}
                        className="py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 font-semibold text-[11px] flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        Tahrirlash
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Panel: Edit Form */}
      {selectedProduct && (
        <div className="bg-[#151c2c] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {selectedProduct.source_id}
              </span>
              <h3 className="text-base font-bold text-white mt-1">Moderatsiya Tahriri</h3>
            </div>
            <button
              onClick={() => setSelectedProduct(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">CN Original Nom:</label>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-slate-400 italic text-[11px]">
                {selectedProduct.name_original}
              </div>
            </div>

            <div>
              <label className="text-slate-200 font-semibold block mb-1">O'zbekcha Nom:</label>
              <input
                type="text"
                value={editNameUz}
                onChange={(e) => setEditNameUz(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/15 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-200 font-semibold block mb-1">Kategoriya:</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/15 text-white outline-none focus:border-cyan-400"
              >
                <option value="">Kategoriyani tanlang</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name_uz}>
                    {c.name_uz}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-200 font-semibold block mb-1">Narxi (CNY ¥):</label>
                <input
                  type="number"
                  step="0.01"
                  value={editPriceCny}
                  onChange={(e) => setEditPriceCny(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/15 text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-slate-200 font-semibold block mb-1">MOQ (Min buyurtma):</label>
                <input
                  type="number"
                  value={editMoq}
                  onChange={(e) => setEditMoq(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/15 text-white outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-200 font-semibold block mb-1">Tavsif (O'zbekcha):</label>
              <textarea
                rows={4}
                value={editDescUz}
                onChange={(e) => setEditDescUz(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/15 text-white outline-none focus:border-cyan-400 resize-y"
              />
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={handleSaveAndValidate}
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all"
              >
                💾 Saqlash va Tekshirish
              </button>
              <button
                onClick={handleManualApprove}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-400 border border-emerald-500/30 font-bold text-xs"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#151c2c] border border-white/15 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-cyan-400" />
              Tizim Valyuta & Markup Sozlamalari
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">1 CNY = ? UZS (Valyuta Kursi):</label>
                <input
                  type="number"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/15 text-white font-bold outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Markup (% ustamasi):</label>
                <input
                  type="number"
                  value={markupPercent}
                  onChange={(e) => setMarkupPercent(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/15 text-white font-bold outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={saveSettingsModal}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
              >
                Saqlash
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
