'use client';

import React, { useState } from 'react';
import { Product } from '@/types/product';
import { formatUZS, resolveImageUrl } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import { X, ShoppingBag, Star, CheckCircle, Package, ShieldCheck, Truck } from 'lucide-react';

interface DetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function DetailModal({ product, onClose }: DetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(product?.moq || 1);
  const addToCart = useCartStore((state) => state.addToCart);

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : product.main_image
    ? [product.main_image]
    : [];

  const activeImg = images[activeImageIndex] || product.main_image || '';
  const priceUzsUnit = product.price_uzs || 0;
  const totalPriceUzs = priceUzsUnit * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#151c2c] border border-white/15 rounded-3xl shadow-2xl custom-scrollbar flex flex-col md:flex-row overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Images */}
        <div className="w-full md:w-1/2 p-6 bg-slate-950/40 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-white/10">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950/80 border border-white/10 flex items-center justify-center p-2 mb-4">
            {activeImg ? (
              <img
                src={resolveImageUrl(activeImg)}
                alt={product.name_uz || product.name_original}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Package className="w-16 h-16 opacity-20 text-slate-400" />
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto max-w-full pb-2 custom-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-cyan-400 scale-105 shadow-md shadow-cyan-500/20'
                      : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={resolveImageUrl(img)}
                    alt={`Thumb ${idx}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Purchase Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider">
                {product.category}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                1688 / Taobao Tasdiqlangan
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">
              {product.name_uz || product.name_original}
            </h2>

            {product.description_uz && (
              <p className="text-sm text-slate-300 bg-white/5 p-3.5 rounded-xl border border-white/5 leading-relaxed">
                {product.description_uz}
              </p>
            )}

            {/* Price Box */}
            <div className="bg-gradient-to-r from-slate-900 to-[#101726] p-4 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">1 dona narxi:</div>
                <div className="text-xl font-extrabold text-cyan-400">
                  {formatUZS(priceUzsUnit)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">1688 Asl Narxi:</div>
                <div className="text-base font-bold text-amber-400">
                  {product.price_cny} ¥
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300 font-semibold">
                <span>Buyurtma miqdori (MOQ: {product.moq} ta):</span>
                <span className="text-cyan-400">Jami: {formatUZS(totalPriceUzs)}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(product.moq || 1, quantity - 1))}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-lg flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min={product.moq || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(product.moq || 1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center py-2 bg-slate-900 border border-white/15 rounded-xl text-white font-bold text-base outline-none focus:border-cyan-400"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-lg flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Add to Cart Action */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <button
              onClick={() => {
                addToCart(product, quantity);
                onClose();
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 transition-all hover:scale-[1.01]"
            >
              <ShoppingBag className="w-5 h-5" />
              Savatga Qo'shish ({quantity} ta)
            </button>
            <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
              <Truck className="w-3.5 h-3.5 text-cyan-400" />
              Xitoy omboridan O'zbekistonga yetkazib berish kafolatlangan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
