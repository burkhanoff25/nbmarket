import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductGrid from './components/ProductGrid';
import AdminDashboard from './components/AdminDashboard';
import DetailModal from './components/DetailModal';

function App() {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'admin'
  const [stats, setStats] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error('Stats loading error:', e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'update' })
      });
      const data = await res.json();
      if (data.success) {
        alert('Sinxronizatsiya muvaffaqiyatli yakunlandi! Narx va zaxiralar yangilandi.');
        fetchStats();
      }
    } catch (e) {
      alert('Sinxronizatsiyada xatolik yuz berdi.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header / Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        stats={stats} 
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      {/* Ikat National Accent Strip */}
      <div 
        className="ikat-accent" 
        style={{ 
          height: '5px', 
          background: 'linear-gradient(90deg, #0B5D9F 0%, #D4A017 25%, #0B5D9F 50%, #D4A017 75%, #0B5D9F 100%)', 
          width: '100%', 
          marginBottom: '32px', 
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(11, 93, 159, 0.2)'
        }}
      ></div>

      <main>
        {activeTab === 'catalog' ? (
          <>
            {/* Hero / Banner Promo Section (Suzani/Ikat CSS Geometric Pattern) */}
            <section 
              className="hero-banner" 
              style={{
                backgroundImage: 'linear-gradient(135deg, rgba(11, 93, 159, 0.85) 0%, rgba(6, 57, 99, 0.75) 100%), url("/nb_market_banner.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                borderRadius: '16px',
                padding: '60px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
                marginBottom: '40px'
              }}
            >
              {/* Geometric Watermark Patterns */}
              <div 
                className="hero-pattern" 
                style={{
                  position: 'absolute',
                  right: '-50px',
                  top: '-50px',
                  width: '300px',
                  height: '300px',
                  border: '40px solid rgba(212, 160, 23, 0.15)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              ></div>
              <div 
                className="hero-pattern-2" 
                style={{
                  position: 'absolute',
                  right: '100px',
                  bottom: '-80px',
                  width: '200px',
                  height: '200px',
                  border: '25px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              ></div>

              <div className="hero-content" style={{ maxWidth: '60%', position: 'relative', zIndex: 2 }}>
                <span 
                  className="hero-tag" 
                  style={{
                    backgroundColor: '#D4A017',
                    color: '#1A202C',
                    padding: '6px 14px',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    borderRadius: '20px',
                    display: 'inline-block',
                    textTransform: 'uppercase',
                    marginBottom: '20px'
                  }}
                >
                  Mavsumiy Taklif
                </span>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 15px 0', lineHeight: '1.2', color: 'white' }}>
                  Taobao Narxlarida To'g'ridan-to'g'ri O'zbekistonda!
                </h2>
                <p style={{ fontSize: '1.1rem', color: '#E2E8F0', marginBottom: '30px', lineHeight: '1.5' }}>
                  Barcha mahsulotlar saralangan, milliy qadriyatlarimizga mos va 100% kafolatlangan. Uyingizgacha tezkor yetkazib beramiz.
                </p>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <a 
                    href="#katalog" 
                    className="hero-btn"
                    style={{ 
                      backgroundColor: '#FFFFFF', 
                      color: '#0B5D9F', 
                      padding: '14px 30px', 
                      borderRadius: '8px', 
                      fontWeight: '700', 
                      cursor: 'pointer', 
                      display: 'inline-block', 
                      transition: 'transform 0.2s',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Hoziroq Xarid Qilish →
                  </a>
                  <button 
                    onClick={() => setActiveTab('admin')} 
                    className="btn-secondary" 
                    style={{ 
                      borderColor: 'rgba(255, 255, 255, 0.3)', 
                      color: '#ffffff', 
                      background: 'rgba(255, 255, 255, 0.05)',
                      height: '50px' 
                    }}
                  >
                    🛡️ Tizimni boshqarish
                  </button>
                </div>
              </div>
            </section>

            {/* Catalog list section */}
            <div id="katalog">
              <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🛍️ Katalog Mahsulotlari
              </h2>
              <ProductGrid onProductClick={setSelectedProduct} />
            </div>
          </>
        ) : (
          /* Admin / Moderation view */
          <AdminDashboard 
            stats={stats} 
            refreshStats={fetchStats}
            onSync={handleSync}
          />
        )}
      </main>

      {/* Footer copyright */}
      <footer style={{
        marginTop: '64px',
        padding: '24px 0',
        borderTop: '1px solid var(--border-light)',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        © 2026 NB Market & Taobao API Platform. Barcha huquqlar himoyalangan.
      </footer>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <DetailModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}

export default App;
