'use client';

import React from 'react';
import { Product } from '@/types/product';
import ProductCard from './ProductCard';
import { PackageX, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onSelectProduct: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
  isAdmin?: boolean;
}

export default function ProductGrid({
  products,
  loading,
  page,
  totalPages,
  onPageChange,
  onSelectProduct,
  onEditProduct,
  isAdmin,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 my-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#151c2c]/40 border border-white/5 rounded-2xl p-4 aspect-[3/4] animate-pulse flex flex-col justify-between"
          >
            <div className="w-full aspect-square bg-slate-800/50 rounded-xl mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-800/60 rounded w-3/4"></div>
              <div className="h-3 bg-slate-800/40 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-slate-800/60 rounded-xl mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="my-12 p-12 text-center bg-[#151c2c]/50 border border-white/10 rounded-2xl max-w-md mx-auto flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-4 text-slate-400">
          <PackageX className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-200">Mahsulotlar topilmadi</h3>
        <p className="text-sm text-slate-400 mt-1">
          Tanlangan filter bo'yicha hech qanday mahsulot mavjud emas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 my-6">
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={onSelectProduct}
            onEdit={onEditProduct}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-white/5">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm text-slate-400 px-3 py-1 font-medium">
            Sahifa <span className="text-white font-bold">{page}</span> / {totalPages}
          </span>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
