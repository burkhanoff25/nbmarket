import React from 'react';
import { CartIcon, BagIcon, ShieldIcon, SyncIcon } from './Icons';

export default function Navbar({ activeTab, setActiveTab, stats, onSync, isSyncing }) {
  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '16px 24px',
      borderRadius: '0 0 var(--radius-md) var(--radius-md)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <CartIcon size={32} color="var(--accent-primary)" />
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(135deg, #fff 0%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            NB MARKET
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', letterSpacing: '0.05em', fontWeight: 600 }}>
            TAOBAO INTEGRATSIYA TIZIMI
          </p>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setActiveTab('catalog')}
          className={activeTab === 'catalog' ? 'btn-primary' : 'btn-secondary'}
          style={{ borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <BagIcon size={16} />
          Mahsulotlar Katalogi
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}
          style={{ 
            borderRadius: 'var(--radius-sm)',
            borderColor: activeTab !== 'admin' && ((stats?.failed || 0) + (stats?.rasm_xatosi || 0)) > 0 ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <ShieldIcon size={16} />
          Moderatsiya
          {((stats?.failed || 0) + (stats?.rasm_xatosi || 0)) > 0 && (
            <span style={{
              background: 'var(--accent-error)',
              color: 'white',
              fontSize: '0.7rem',
              padding: '2px 6px',
              borderRadius: '999px',
              marginLeft: '6px',
              boxShadow: '0 0 8px var(--accent-error)'
            }}>
              {(stats.failed || 0) + (stats.rasm_xatosi || 0)} xato
            </span>
          )}
        </button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem' }} className="stats-quickview">
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--text-secondary)' }}>Kurs (CNY):</div>
            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>1 ¥ = {stats?.exchange_rate || 1820} UZS</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-light)' }}></div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--text-secondary)' }}>Faol katalog:</div>
            <div style={{ fontWeight: 'bold', color: 'var(--accent-success)' }}>{stats?.approved || 0} ta</div>
          </div>
        </div>

        <button 
          onClick={onSync} 
          disabled={isSyncing} 
          className="btn-secondary" 
          style={{ height: '40px', gap: '8px', display: 'flex', alignItems: 'center' }}
        >
          {isSyncing ? <div className="spinner"></div> : <SyncIcon size={16} />}
          {isSyncing ? 'Yangilanmoqda...' : 'Sinxronizatsiya'}
        </button>
      </div>
    </header>
  );
}
