import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { TrashIcon, SearchIcon } from './Icons';

export default function ProductGrid({ onProductClick }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [moqFilter, setMoqFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load categories list
  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Load only APPROVED products for user catalog view
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      let url = `/api/products?status=approved&search=${search}&page=${currentPage}&limit=12`;
      if (selectedCategory) {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      if (moqFilter) {
        url += `&moq=${moqFilter}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalProducts(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, search, moqFilter, currentPage]);

  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleMoqChange = (e) => {
    setMoqFilter(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearch('');
    setMoqFilter('');
    setCurrentPage(1);
  };

  return (
    <div className="animate-fade-in">
      
      {/* Category Selection Carousel */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '24px',
        scrollbarWidth: 'none' /* Firefox */
      }} className="category-scroll">
        <button
          onClick={() => handleCategorySelect('')}
          className={selectedCategory === '' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', borderRadius: '999px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
        >
          All Categories (Barchasi)
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => handleCategorySelect(c.name_uz)}
            className={selectedCategory === c.name_uz ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', borderRadius: '999px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
          >
            {c.name_uz}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{
        padding: '16px 24px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '24px'
      }}>
        {/* Left: Search box */}
        <div style={{ flexGrow: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Mahsulot nomi yoki Taobao ID bo'yicha qidirish..."
            value={search}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-light)',
              color: 'white',
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem'
            }}
          />
        </div>

        {/* Right: MOQ filter and clear */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Max MOQ:</label>
            <select
              value={moqFilter}
              onChange={handleMoqChange}
              style={{
                background: '#151522',
                border: '1px solid var(--border-light)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem'
              }}
            >
              <option value="">Barchasi</option>
              <option value="1">Faqat 1 ta (Dona sotiladigan)</option>
              <option value="2">2 ta gacha</option>
              <option value="5">5 ta gacha</option>
            </select>
          </div>

          {(selectedCategory || search || moqFilter) && (
            <button 
              onClick={clearFilters} 
              className="btn-secondary" 
              style={{ padding: '8px 14px', fontSize: '0.8rem', borderColor: 'var(--accent-error)', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <TrashIcon size={14} color="var(--accent-error)" />
              Filtrlarni tozalash
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '64px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <SearchIcon size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '16px' }} />
          <h3>Mahsulotlar topilmadi</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.9rem' }}>Qidiruv kalit so'zlarini yoki filtrlarni o'zgartirib ko'ring.</p>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onClick={onProductClick}
                isAdmin={false}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--border-light)',
              paddingTop: '20px'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Ko'rsatilmoqda: <strong>{products.length}</strong> / <strong>{totalProducts}</strong> mahsulot
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn-secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  style={{ padding: '6px 12px' }}
                >
                  ◀ Avvalgi
                </button>
                <span style={{ alignSelf: 'center', fontSize: '0.9rem', fontWeight: 600, padding: '0 12px' }}>
                  {currentPage} / {totalPages}
                </span>
                <button
                  className="btn-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  style={{ padding: '6px 12px' }}
                >
                  Keyingi ▶
                </button>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
