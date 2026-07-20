import React from 'react';
import { PackageIcon, StarIcon, FlagCnIcon, SettingsIcon, EditIcon } from './Icons';

const SVG_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="%231a1a2e"/><g fill="%236366f1" opacity="0.15"><circle cx="150" cy="100" r="70"/><path d="M0,200 Q75,130 150,200 T300,200 Z"/></g><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="24" fill="%23a5b4fc">NB Market</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%23818cf8">Rasm yuklanmadi</text></svg>';

export default function ProductCard({ product, onClick, onEdit, isAdmin }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ', { style: 'decimal' }).format(price) + ' UZS';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="badge badge-approved">Tasdiqlangan</span>;
      case 'pending': return <span className="badge badge-pending">Kutilmoqda</span>;
      case 'failed': return <span className="badge badge-failed">Xato Bor</span>;
      case 'rasm_xatosi': return <span className="badge badge-failed" style={{ background: '#ec4899' }}>Rasm Xatosi</span>;
      default: return null;
    }
  };

  const getStockBadge = (stock) => {
    return stock === 'instock' 
      ? <span className="badge badge-instock" style={{ fontSize: '0.65rem' }}>Mavjud</span>
      : <span className="badge badge-outofstock" style={{ fontSize: '0.65rem' }}>Tugagan</span>;
  };

  // Truncate text
  const truncate = (str, len) => {
    if (!str) return '—';
    return str.length > len ? str.slice(0, len) + '...' : str;
  };

  return (
    <div 
      className="glass-card animate-fade-in" 
      onClick={() => onClick(product)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      {/* Product Image */}
      <div style={{
        width: '100%',
        height: '200px',
        background: '#151522',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {product.main_image ? (
          <img 
            src={product.main_image} 
            alt={product.name_uz || 'Mahsulot'} 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = SVG_PLACEHOLDER;
            }}
          />
        ) : (
          <PackageIcon size={48} style={{ opacity: 0.2, color: 'var(--text-secondary)' }} />
        )}
        
        {/* Absolute badges over image */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          zIndex: 2
        }}>
          {getStockBadge(product.stock_status)}
          {isAdmin && getStatusBadge(product.status)}
        </div>

        {product.rating > 0 && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.65)',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            backdropFilter: 'blur(4px)',
            color: '#fbbf24',
            zIndex: 2
          }}>
            <StarIcon size={12} />
            {product.rating}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div>
          {/* Category */}
          <span style={{
            fontSize: '0.7rem',
            color: 'var(--accent-secondary)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {product.category}
          </span>

          {/* Uzbek Title */}
          <h3 style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            marginTop: '4px',
            lineHeight: '1.3',
            height: '40px',
            overflow: 'hidden',
            color: 'var(--text-primary)'
          }}>
            {truncate(product.name_uz, 50) || <span style={{ color: 'var(--accent-error)', fontStyle: 'italic' }}>Tarjima qilinmagan</span>}
          </h3>

          {/* Original Chinese Title (for Admin reference) */}
          {isAdmin && (
            <p style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              marginTop: '4px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'flex',
              alignItems: 'center'
            }}>
              <FlagCnIcon size={12} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name_original}</span>
            </p>
          )}
        </div>

        {/* Footer Details */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '8px'
          }}>
            <div>
              <span style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: 'var(--text-primary)'
              }}>
                {product.price_uzs ? formatPrice(product.price_uzs) : 'Xato Narx'}
              </span>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Original: {product.price_cny} ¥ (CNY)
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              MOQ: <strong style={{ color: 'var(--text-primary)' }}>{product.moq} ta</strong>
            </div>
          </div>

          {isAdmin && (product.status === 'failed' || product.status === 'rasm_xatosi') ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, var(--accent-error) 0%, #b91c1c 100%)',
                boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)'
              }}
            >
              <SettingsIcon size={14} />
              Xatolikni Tuzatish
            </button>
          ) : isAdmin ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className="btn-secondary"
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <EditIcon size={14} />
              Tahrirlash
            </button>
          ) : (
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              borderTop: '1px solid var(--border-light)',
              paddingTop: '8px',
              textAlign: 'center'
            }}>
              Batafsil ma'lumot olish
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
