'use client';

import React, { useState } from 'react';
import { Product } from '@/types/product';
import { formatUZS, resolveImageUrl } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  onEdit?: (product: Product) => void;
  isAdmin?: boolean;
}

export default function ProductCard({ product, onClick, onEdit, isAdmin }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, product.moq || 1);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  const mainImg = product.main_image || (product.images && product.images[0]) || '';
  const salesCount = product.sales_30d || Math.floor(Math.random() * 250) + 60;
  const location = product.location || 'Guangzhou';

  return (
    <div
      onClick={() => onClick(product)}
      className="group relative w-full bg-[#151c2c] hover:bg-[#1a2337] border border-white/10 hover:border-[#ff4757]/60 rounded-xl overflow-hidden transition-all duration-300 flex flex-col cursor-pointer shadow-lg hover:-translate-y-1 hover:shadow-2xl"
    >
      {/* 1. 1688 POSTER RASM CONTAINER (260px) */}
      <div className="relative w-full h-[260px] bg-slate-950 overflow-hidden">
        {mainImg ? (
          <img
            src={resolveImageUrl(mainImg)}
            alt={product.name_uz || product.name_original}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
            Rasm yo'q
          </div>
        )}

        {/* Subtle overlay gradient */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/80 text-white backdrop-blur-md shadow">
            {product.stock_status === 'instock' ? 'Mavjud' : 'Tugagan'}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#ff4757] text-white shadow uppercase">
            1688 DIRECT
          </span>
        </div>

        {/* Bottom Right HOT / Rating Badge */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <div className="px-2.5 py-1 rounded-full bg-[#ff4757] text-white text-[11px] font-black shadow-lg">
            {product.discount ? `-${product.discount}%` : 'HOT'}
          </div>
        </div>
      </div>

      {/* 2. MA'LUMOT QISMI */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3 bg-[#151c2c]">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
            {product.category || 'Boshqa'}
          </span>

          <h3 className="text-[13px] font-semibold text-slate-100 line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
            {product.name_uz || product.name_original}
          </h3>

          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#ff4757]/60 text-[#ff4757]">
              7kun almashtirish
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-cyan-500/40 text-cyan-400">
              Kafolatlangan
            </span>
          </div>
        </div>

        {/* Narx Bloki */}
        <div className="space-y-1 pt-2 border-t border-white/5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-[20px] font-bold" style={{ color: '#ff4757' }}>
                ¥{product.price_cny}
              </span>
              <span className="text-[11px] text-slate-400">
                {product.moq > 1 ? 'Optom' : 'Bir dona'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              MOQ: <strong className="text-slate-200">{product.moq} ta</strong>
            </span>
          </div>

          <div className="text-[13px] font-extrabold text-white">
            {formatUZS(product.price_uzs)}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span>30 kunda {salesCount}+ ta sotildi</span>
            <span>Xitoy · {location}</span>
          </div>
        </div>

        {/* 3. TUGMALAR */}
        <div className="pt-2 flex gap-2">
          {isAdmin && onEdit ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className="w-full py-2 px-3 rounded text-xs font-bold bg-purple-600/20 text-purple-300 border border-purple-500/40 hover:bg-purple-600/30 transition-colors"
            >
              Tahrirlash
            </button>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(product);
                }}
                className="flex-1 py-2 px-2.5 rounded text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/15 transition-colors text-center"
              >
                Batafsil ko'rish
              </button>
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-2 px-2.5 rounded text-xs font-bold transition-all text-center flex items-center justify-center gap-1 ${
                  added
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                }`}
              >
                {added ? '✓ Qo\'shildi' : 'Savatga qo\'shish'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
