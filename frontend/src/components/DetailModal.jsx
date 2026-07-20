import React, { useState } from 'react';

const SVG_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="%231a1a2e"/><g fill="%236366f1" opacity="0.15"><circle cx="150" cy="100" r="70"/><path d="M0,200 Q75,130 150,200 T300,200 Z"/></g><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="24" fill="%23a5b4fc">NB Market</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%23818cf8">Rasm yuklanmadi</text></svg>';

export default function DetailModal({ product, onClose }) {
  if (!product) return null;

  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ', { style: 'decimal' }).format(price) + ' UZS';
  };

  const images = product.images || [];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 5, 10, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px'
    }} onClick={onClose}>
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-lg)',
          overflowY: 'auto',
          padding: '32px',
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-light)',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition-smooth)'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
        >
          ✕
        </button>

        {/* Left Side: Images Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Main Large Image */}
          <div style={{
            width: '100%',
            height: '350px',
            borderRadius: 'var(--radius-md)',
            background: '#151522',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-light)'
          }}>
            {images.length > 0 ? (
              <img 
                src={images[activeImageIdx]} 
                alt={product.name_uz} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = SVG_PLACEHOLDER;
                }}
              />
            ) : (
              <span style={{ fontSize: '4rem', opacity: 0.2 }}>📦</span>
            )}
          </div>

          {/* Thumbnail row */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: 'var(--radius-sm)',
                    border: activeImageIdx === idx ? '2px solid var(--accent-primary)' : '1px solid var(--border-light)',
                    background: '#151522',
                    padding: 0,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'var(--transition-smooth)'
                  }}
                >
                   <img 
                    src={img} 
                    alt="" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = SVG_PLACEHOLDER;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
          
          {/* Extra product specification specs */}
          <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
            <h4 style={{ marginBottom: '8px', color: 'var(--accent-secondary)' }}>Logistika & Manba Ma'lumotlari</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>Original ID:</div>
              <div style={{ textAlign: 'right', fontWeight: 'bold' }}>{product.source_id}</div>
              <div>Min. buyurtma (MOQ):</div>
              <div style={{ textAlign: 'right', fontWeight: 'bold' }}>{product.moq} ta</div>
              <div>Reyting:</div>
              <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#fbbf24' }}>★ {product.rating || 'Noma\'lum'}</div>
              <div>Oxirgi sinxronizatsiya:</div>
              <div style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{new Date(product.last_synced_at).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Right Side: Product Details info */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Category Tag */}
            <span style={{
              background: 'rgba(6, 182, 212, 0.1)',
              color: 'var(--accent-secondary)',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'inline-block',
              marginBottom: '12px'
            }}>
              {product.category}
            </span>

            {/* Uzbek Title */}
            <h2 style={{ fontSize: '1.6rem', lineHeight: '1.2', marginBottom: '8px' }}>
              {product.name_uz || <span style={{ color: 'var(--accent-error)' }}>Nomsiz Mahsulot</span>}
            </h2>

            {/* Chinese Title */}
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              🇨🇳 Xitoycha asl nomi: <span style={{ fontStyle: 'italic' }}>{product.name_original}</span>
            </p>

            <div style={{ width: '100%', height: '1px', background: 'var(--border-light)', marginBottom: '20px' }}></div>

            {/* Price breakdown */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Katalogdagi narxi:</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '4px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {formatPrice(product.price_uzs)}
                </span>
                <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '0.95rem' }}>
                  {formatPrice(Math.round(product.price_uzs * 1.3 / 100) * 100)}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                * Narxga Taobao dagi asl narxi ({product.price_cny} ¥), yetkazib berish haqi va NB Market xizmat foizlari kiritilgan.
              </p>
            </div>

            {/* Uzbek Description */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Mahsulot Tavsifi</h4>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#cbd5e1', maxHeight: '180px', overflowY: 'auto', paddingRight: '8px' }}>
                {product.description_uz || 'Mahsulot uchun o\'zbekcha tavsif mavjud emas.'}
              </p>
            </div>
          </div>

          {/* Purchase button or options */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button 
              className="btn-primary" 
              style={{ flexGrow: 1, justifyContent: 'center', height: '48px', fontSize: '1rem' }}
              onClick={() => alert(`Sotib olish buyurtmasi shakllantirildi!\nMahsulot: ${product.name_uz}\nID: ${product.source_id}`)}
            >
              🛍️ Hoziroq Buyurtma Berish
            </button>
            <button 
              className="btn-secondary" 
              style={{ width: '48px', height: '48px', padding: 0, justifyContent: 'center' }}
              onClick={() => alert('Sevimlilarga qo\'shildi')}
            >
              ❤️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
