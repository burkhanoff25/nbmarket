'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { getProducts, getCategories, getStats } from '@/lib/api';
import { Product, Stats } from '@/types/product';
import ProductGrid from '@/components/shop/ProductGrid';
import DetailModal from '@/components/shop/DetailModal';
import { Search, ShoppingBag, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // SWR Data Fetching
  const { data: statsData } = useSWR<Stats>('/stats', getStats);
  const { data: categoriesData } = useSWR('/categories', getCategories);
  const { data: productsData, isLoading } = useSWR(
    ['/products', selectedCategory, searchTerm, page],
    () =>
      getProducts({
        category: selectedCategory || undefined,
        search: searchTerm || undefined,
        status: 'approved',
        page,
        limit: 12,
      })
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-white/10 p-8 md:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            1688 & Taobao Direct Import
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Xitoyning Zarur Mahsulotlari — <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">To'g'ridan-To'g'ri Narxda</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Biznesingiz yoki shaxsiy foydalanishingiz uchun Xitoy zavodlaridan eng hamyonbop mahsulotlarni so'mda va yetkazib berish kafolati bilan xarid qiling.
          </p>

          {/* Quick Stats Pills */}
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{statsData?.approved || 0}+ Tasdiqlangan Tovar</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-200">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Valyuta: 1 CNY = {statsData?.exchange_rate || 1820} UZS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#151c2c]/80 p-4 rounded-2xl border border-white/10">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Mahsulot nomi bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar">
          <button
            onClick={() => {
              setSelectedCategory('');
              setPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === ''
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            Barchasi
          </button>
          {categoriesData?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.name_uz);
                setPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.name_uz
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {cat.name_uz}
            </button>
          ))}
        </div>
      </div>

      {/* Product Catalog Grid */}
      <ProductGrid
        products={productsData?.products || []}
        loading={isLoading}
        page={page}
        totalPages={productsData?.totalPages || 1}
        onPageChange={setPage}
        onSelectProduct={setSelectedProduct}
      />

      {/* Detail Modal */}
      <DetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
