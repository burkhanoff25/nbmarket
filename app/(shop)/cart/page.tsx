'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { formatUZS, resolveImageUrl } from '@/lib/utils';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, ShieldCheck, ShoppingCart } from 'lucide-react';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPriceUzs } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalPrice = getTotalPriceUzs();

  if (cart.length === 0) {
    return (
      <div className="my-16 text-center max-w-md mx-auto space-y-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Savatingiz hozircha bo'sh</h2>
          <p className="text-sm text-slate-400">
            Katalogimizdan o'zingizga ma'qul mahsulotlarni tanlab savatga qo'shing.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Katalogga o'tish
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 my-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
          <ShoppingBag className="w-7 h-7 text-cyan-400" />
          Xarid Savati ({cart.length} turdagi tovar)
        </h1>

        <button
          onClick={clearCart}
          className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 font-semibold"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Savatni tozalash
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(({ product, quantity }) => {
            const unitPrice = product.price_uzs || 0;
            const itemTotal = unitPrice * quantity;
            const mainImg = product.main_image || (product.images && product.images[0]) || '';

            return (
              <div
                key={product.id}
                className="bg-[#151c2c]/80 border border-white/10 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={resolveImageUrl(mainImg)}
                    alt={product.name_uz || product.name_original}
                    className="w-20 h-20 object-cover rounded-xl bg-slate-900 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <h3 className="text-sm font-bold text-white line-clamp-1">
                      {product.name_uz || product.name_original}
                    </h3>
                    <div className="text-xs text-slate-400">
                      Dona narxi: <span className="text-slate-200 font-semibold">{formatUZS(unitPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-white text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-cyan-400">
                      {formatUZS(itemTotal)}
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Box */}
        <div className="bg-[#151c2c] border border-white/10 rounded-3xl p-6 h-fit space-y-6 shadow-2xl">
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-4">
            Buyurtma Xulosasi
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Mahsulotlar qiymati:</span>
              <span className="font-bold text-white">{formatUZS(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Yetkazib berish (Toshkent):</span>
              <span className="text-emerald-400 font-semibold">Bepul</span>
            </div>
            <div className="pt-3 border-t border-white/10 flex justify-between text-base font-extrabold text-white">
              <span>Jami:</span>
              <span className="text-cyan-400 text-xl">{formatUZS(totalPrice)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 transition-all"
          >
            <span>Rasmiylashtirishga O'tish</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
