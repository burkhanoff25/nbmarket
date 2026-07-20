import React, { useState, useEffect } from 'react';
import { AlertIcon, ClockIcon, CheckIcon, ImageIcon, LightningIcon, SyncIcon, EditIcon, SettingsIcon, BagIcon } from './Icons';

export default function AdminDashboard({ stats, refreshStats, onSync }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productLogs, setProductLogs] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('failed'); // 'failed' | 'pending' | 'approved'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingSeed, setIsSyncingSeed] = useState(false);
  const [isSyncingDaily, setIsSyncingDaily] = useState(false);
  const [isSyncingTaobao, setIsSyncingTaobao] = useState(false);

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(1820);
  const [markupPercent, setMarkupPercent] = useState(25);

  // Edit form state
  const [editNameUz, setEditNameUz] = useState('');
  const [editDescUz, setEditDescUz] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPriceCny, setEditPriceCny] = useState('');
  const [editMoq, setEditMoq] = useState('');
  const [editStockStatus, setEditStockStatus] = useState('instock');

  // Load products based on sub-tab, search, and page
  const loadProducts = async () => {
    try {
      const res = await fetch(`/api/products?status=${activeSubTab}&search=${searchTerm}&page=${currentPage}&limit=10`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
    } catch (e) {
      console.error("Xatolik yuklashda:", e);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [activeSubTab, searchTerm, currentPage]);

  useEffect(() => {
    loadCategories();
  }, []);

  const selectProductForEditing = async (p) => {
    try {
      setSelectedProduct(p);
      setEditNameUz(p.name_uz || '');
      setEditDescUz(p.description_uz || '');
      setEditCategory(p.category || '');
      setEditPriceCny(p.price_cny || 0);
      setEditMoq(p.moq || 1);
      setEditStockStatus(p.stock_status || 'instock');

      // Fetch validation logs for this product
      const res = await fetch(`/api/products/${p.id}`);
      const data = await res.json();
      setProductLogs(data.logs || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveAndValidate = async () => {
    if (!selectedProduct) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name_uz: editNameUz,
          description_uz: editDescUz,
          category: editCategory,
          price_cny: parseFloat(editPriceCny),
          moq: parseInt(editMoq, 10),
          stock_status: editStockStatus
        })
      });
      const data = await response.json();
      
      if (data.success) {
        if (data.errors && data.errors.length > 0) {
          alert(`Saqlandi, lekin mahsulot tekshiruvdan o'tolmadi:\n\n${data.errors.join('\n')}`);
          setProductLogs(data.errors.map(err => ({ error_message: err })));
          // Refresh lists
          loadProducts();
          refreshStats();
          // Update selected
          setSelectedProduct(data.product);
        } else {
          alert("Ajoyib! Mahsulot muvaffaqiyatli tekshiruvdan o'tdi va katalogga qo'shildi.");
          setSelectedProduct(null);
          loadProducts();
          refreshStats();
        }
      }
    } catch (e) {
      alert("Xatolik yuz berdi saqlashda");
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualApprove = async () => {
    if (!selectedProduct) return;
    if (confirm("Ushbu mahsulotni barcha xatoliklarga qaramay majburiy tasdiqlashni xohlaysizmi?")) {
      try {
        const response = await fetch(`/api/products/${selectedProduct.id}/approve`, {
          method: 'POST'
        });
        const data = await response.json();
        if (data.success) {
          alert("Mahsulot majburiy ravishda tasdiqlandi!");
          setSelectedProduct(null);
          loadProducts();
          refreshStats();
        }
      } catch (e) {
        alert("Xatolik tasdiqlashda");
      }
    }
  };

  const handleSyncAction = async (mode) => {
    if (mode === 'seed') {
      if (!confirm("Ma'lumotlar bazasini o'chirib qayta 600 ta mahsulot yuklashni xohlaysizmi?")) return;
      setIsSyncingSeed(true);
    } else {
      setIsSyncingDaily(true);
    }

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Sinxronizatsiya yakunlandi!\nTasdiqlandi: ${data.stats.approved}\nKutilmoqda: ${data.stats.pending}\nXato aniqlandi: ${data.stats.failed}`);
        loadProducts();
        refreshStats();
      }
    } catch (e) {
      alert("Sinxronizatsiyada xatolik yuz berdi");
    } finally {
      setIsSyncingSeed(false);
      setIsSyncingDaily(false);
    }
  };

  const handleTaobaoSync = async () => {
    setIsSyncingTaobao(true);
    try {
      const res = await fetch('/api/sync/taobao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        alert(`Taobao API sinxronizatsiyasi yakunlandi!\nTasdiqlandi: ${data.stats.approved || 0}\nKutilmoqda: ${data.stats.pending || 0}\nMuammoli (Rasm xatosi): ${data.stats.failed || 0}`);
        loadProducts();
        refreshStats();
      } else {
        alert(`Taobao sinxronizatsiyasi amalga oshmadi: ${data.message || 'Noma\'lum xato'}`);
      }
    } catch (e) {
      alert("Taobao sinxronizatsiyasida tarmoq xatoligi yuz berdi");
    } finally {
      setIsSyncingTaobao(false);
    }
  };

  const openSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setExchangeRate(parseFloat(data.EXCHANGE_RATE) || 1820);
      setMarkupPercent(parseFloat(data.MARKUP_PERCENTAGE) * 100 || 25);
      setShowSettings(true);
    } catch (e) {
      console.error(e);
    }
  };

  const saveSettings = async () => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          EXCHANGE_RATE: exchangeRate,
          MARKUP_PERCENTAGE: markupPercent / 100
        })
      });
      alert('Sozlamalar saqlandi!');
      setShowSettings(false);
      refreshStats();
    } catch (e) {
      alert('Sozlamalarni saqlashda xatolik');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: selectedProduct ? '1.2fr 1fr' : '1fr', gap: '24px' }}>
      
      {/* Left panel: Product List & Controls */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
        
        {/* Sync panel section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }} className="admin-actions">
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>Tizim Integratsiyasi & Nazorati</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sinxronizatsiya va import jarayonlarini boshqarish</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn-secondary" 
              onClick={openSettings} 
              style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <SettingsIcon size={14} />
              Sozlamalar
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => handleSyncAction('update')} 
              disabled={isSyncingDaily || isSyncingSeed || isSyncingTaobao}
              style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {isSyncingDaily ? <div className="spinner" style={{ marginRight: '6px' }}></div> : <LightningIcon size={14} />}
              Kunlik Yangilanish (Simulyatsiya)
            </button>
            <button 
              className="btn-primary" 
              onClick={handleTaobaoSync} 
              disabled={isSyncingTaobao || isSyncingSeed || isSyncingDaily}
              style={{ fontSize: '0.85rem', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {isSyncingTaobao ? <div className="spinner" style={{ marginRight: '6px' }}></div> : <BagIcon size={14} />}
              Taobao API Sinxronizatsiyasi
            </button>
            <button 
              className="btn-primary" 
              onClick={() => handleSyncAction('seed')} 
              disabled={isSyncingSeed || isSyncingDaily || isSyncingTaobao}
              style={{ fontSize: '0.85rem', background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', boxShadow: '0 4px 12px rgba(236, 72, 153, 0.25)', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {isSyncingSeed ? <div className="spinner" style={{ marginRight: '6px' }}></div> : <SyncIcon size={14} />}
              Bazani Qayta Yuklash (600 ta mahsulot)
            </button>
          </div>
        </div>

        <div style={{ width: '100%', height: '1px', background: 'var(--border-light)', marginBottom: '24px' }}></div>

        {/* Filters and Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
          {/* Tab Filters */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '4px' }}>
            <button
              onClick={() => { setActiveSubTab('failed'); setCurrentPage(1); }}
              style={{
                background: activeSubTab === 'failed' ? 'var(--accent-error)' : 'transparent',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 'calc(var(--radius-sm) - 2px)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'var(--transition-smooth)'
              }}
            >
              <AlertIcon size={14} />
              Xatosi Borlar ({stats?.failed || 0})
            </button>
            <button
              onClick={() => { setActiveSubTab('pending'); setCurrentPage(1); }}
              style={{
                background: activeSubTab === 'pending' ? 'var(--accent-warning)' : 'transparent',
                color: activeSubTab === 'pending' ? 'black' : 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 'calc(var(--radius-sm) - 2px)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'var(--transition-smooth)'
              }}
            >
              <ClockIcon size={14} />
              Kutilmoqda ({stats?.pending || 0})
            </button>
            <button
              onClick={() => { setActiveSubTab('approved'); setCurrentPage(1); }}
              style={{
                background: activeSubTab === 'approved' ? 'var(--accent-success)' : 'transparent',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 'calc(var(--radius-sm) - 2px)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'var(--transition-smooth)'
              }}
            >
              <CheckIcon size={14} />
              Tasdiqlangan ({stats?.approved || 0})
            </button>
            <button
              onClick={() => { setActiveSubTab('rasm_xatosi'); setCurrentPage(1); }}
              style={{
                background: activeSubTab === 'rasm_xatosi' ? '#ec4899' : 'transparent',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 'calc(var(--radius-sm) - 2px)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'var(--transition-smooth)'
              }}
            >
              <ImageIcon size={14} />
              Rasm Xatosi ({stats?.rasm_xatosi || 0})
            </button>
          </div>

          {/* Search box */}
          <input
            type="text"
            placeholder="Mahsulot nomi yoki Taobao ID..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-light)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              width: '260px',
              fontSize: '0.85rem'
            }}
          />
        </div>

        {/* Product List Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 8px' }}>Rasm</th>
                <th style={{ padding: '12px 8px' }}>Taobao ID</th>
                <th style={{ padding: '12px 8px' }}>Mahsulot (UZ)</th>
                <th style={{ padding: '12px 8px' }}>Original Narxi (CNY)</th>
                <th style={{ padding: '12px 8px' }}>Sotish Narxi (UZS)</th>
                <th style={{ padding: '12px 8px' }}>Harakat</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    Mahsulotlar topilmadi
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr 
                    key={p.id} 
                    style={{ 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: selectedProduct?.id === p.id ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                      cursor: 'pointer'
                    }}
                    onClick={() => selectProductForEditing(p)}
                  >
                    <td style={{ padding: '8px' }}>
                      <img 
                        src={(Array.isArray(p.images) ? p.images : JSON.parse(p.images || '[]'))[0] || ''} 
                        alt="" 
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', background: '#151522' }} 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWxsPScjMTUxNTIyJy8+PC9zdmc+';
                        }}
                      />
                    </td>
                    <td style={{ padding: '8px', fontFamily: 'monospace', color: 'var(--accent-secondary)' }}>{p.source_id}</td>
                    <td style={{ padding: '8px', fontWeight: 500 }}>
                      <div style={{ maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.name_uz || <span style={{ color: 'var(--accent-error)', fontStyle: 'italic' }}>Tarjima qilinmagan</span>}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.name_original}
                      </div>
                    </td>
                    <td style={{ padding: '8px' }}>{p.price_cny} ¥</td>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>
                      {p.price_uzs ? new Intl.NumberFormat('uz-UZ').format(p.price_uzs) + ' UZS' : 'Xatolik'}
                    </td>
                    <td style={{ padding: '8px' }}>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectProductForEditing(p);
                        }}
                      >
                        Tahrirlash
                        <EditIcon size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Jami: <strong>{totalCount}</strong> ta mahsulot
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="btn-secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                style={{ padding: '4px 10px' }}
              >
                ◀
              </button>
              <span style={{ alignSelf: 'center', fontSize: '0.85rem', padding: '0 8px' }}>
                {currentPage} / {totalPages}
              </span>
              <button
                className="btn-secondary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                style={{ padding: '4px 10px' }}
              >
                ▶
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Right panel: Moderation Form Editor */}
      {selectedProduct && (
        <div className="glass-panel animate-fade-in" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', height: 'fit-content', border: '1px solid var(--accent-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span className="badge badge-pending">{selectedProduct.source_id}</span>
              <h3 style={{ fontSize: '1.2rem', marginTop: '4px' }}>Moderatsiya Tahriri</h3>
            </div>
            <button 
              onClick={() => setSelectedProduct(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              ✕
            </button>
          </div>

          {/* Validation Errors Alert Box */}
          {productLogs.length > 0 && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '0.8rem'
            }}>
              <h4 style={{ color: 'var(--accent-error)', fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertIcon size={16} />
                Pre-launch tekshiruvida xatoliklar:
              </h4>
              <ul style={{ paddingLeft: '16px', color: '#fca5a5', lineHeight: '1.4' }}>
                {productLogs.map((log, i) => (
                  <li key={i}>{log.error_message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Edit Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.85rem' }}>
            
            {/* CN Title Ref */}
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>🇨🇳 Original Nom (Xitoycha - o'zgartirib bo'lmaydi)</label>
              <div style={{ background: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: 'var(--radius-sm)', color: '#94a3b8', fontStyle: 'italic', border: '1px solid var(--border-light)' }}>
                {selectedProduct.name_original}
              </div>
            </div>

            {/* UZ Title Input */}
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>O'zbekcha Nom (Lotin alifbosida, min. 6 ta so'z)</label>
              <input
                type="text"
                value={editNameUz}
                onChange={(e) => setEditNameUz(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-light)',
                  color: 'white',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)'
                }}
              />
            </div>

            {/* Category Select */}
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Kategoriya</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                style={{
                  width: '100%',
                  background: '#151522',
                  border: '1px solid var(--border-light)',
                  color: 'white',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <option value="">Kategoriyani tanlang</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name_uz}>{c.name_uz}</option>
                ))}
              </select>
            </div>

            {/* Price and MOQ inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Original Narxi (CNY ¥)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editPriceCny}
                  onChange={(e) => setEditPriceCny(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-light)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                />
              </div>
              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Min Buyurtma (MOQ)</label>
                <input
                  type="number"
                  value={editMoq}
                  onChange={(e) => setEditMoq(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-light)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                />
              </div>
            </div>

            {/* Stock status select */}
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Ombordagi Holati</label>
              <select
                value={editStockStatus}
                onChange={(e) => setEditStockStatus(e.target.value)}
                style={{
                  width: '100%',
                  background: '#151522',
                  border: '1px solid var(--border-light)',
                  color: 'white',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <option value="instock">Mavjud (In Stock)</option>
                <option value="outofstock">Tugagan (Out of Stock)</option>
              </select>
            </div>

            {/* UZ Description TextArea */}
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Tavsif (O'zbekcha, min. 40 ta so'z)</label>
              <textarea
                rows="6"
                value={editDescUz}
                onChange={(e) => setEditDescUz(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-light)',
                  color: 'white',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  lineHeight: '1.4',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Form actions buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button
                className="btn-success"
                onClick={handleSaveAndValidate}
                disabled={isSaving}
                style={{ flexGrow: 1, justifyContent: 'center' }}
              >
                {isSaving ? <div className="spinner"></div> : '💾 Saqlash va Tekshirish'}
              </button>
              
              <button
                className="btn-secondary"
                onClick={handleManualApprove}
                style={{ 
                  borderColor: 'rgba(16, 185, 129, 0.4)', 
                  color: '#34d399', 
                  flexGrow: 1, 
                  justifyContent: 'center' 
                }}
              >
                ✔️ Majburiy Ruxsat
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(5, 5, 10, 0.8)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass-panel" style={{ padding: '24px', width: '400px', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ marginBottom: '16px' }}>⚙️ Tizim Sozlamalari (Narx va Foizlar)</h3>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>Valyuta Kursi (1 CNY = ? UZS)</label>
              <input type="number" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-light)', borderRadius: '4px' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>Bizning Foizimiz (Markup %)</label>
              <input type="number" value={markupPercent} onChange={e => setMarkupPercent(e.target.value)} style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-light)', borderRadius: '4px' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-success" onClick={saveSettings} style={{ flexGrow: 1, padding: '10px' }}>💾 Saqlash</button>
              <button className="btn-secondary" onClick={() => setShowSettings(false)} style={{ flexGrow: 1, padding: '10px' }}>Bekor qilish</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
