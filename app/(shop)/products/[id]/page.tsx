import { getProductById } from '@/lib/api';
import { formatUZS, resolveImageUrl } from '@/lib/utils';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Truck, Package, Star } from 'lucide-react';
import type { Metadata } from 'next';

interface ProductPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const data = await getProductById(params.id);
    return {
      title: `${data.product.name_uz || data.product.name_original} — NB Market`,
      description: data.product.description_uz || data.product.name_original,
    };
  } catch {
    return {
      title: 'Mahsulot — NB Market',
    };
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  let productData;
  try {
    productData = await getProductById(params.id);
  } catch (err) {
    notFound();
  }

  const { product } = productData;
  const images = product.images && product.images.length > 0 ? product.images : [product.main_image || ''];

  return (
    <div className="space-y-8 animate-fade-in my-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Katalogga qaytish
      </Link>

      <div className="bg-[#151c2c] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Main Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
            <img
              src={resolveImageUrl(images[0])}
              alt={product.name_uz || product.name_original}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-slate-900 flex-shrink-0">
                  <img src={resolveImageUrl(img)} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider">
              {product.category}
            </span>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
              {product.name_uz || product.name_original}
            </h1>

            <p className="text-xs text-slate-400 italic">
              Original Nom (CN): {product.name_original}
            </p>

            {product.description_uz && (
              <p className="text-sm text-slate-300 bg-white/5 p-4 rounded-2xl border border-white/5 leading-relaxed">
                {product.description_uz}
              </p>
            )}

            {/* Price Box */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Katalog Narxi:</span>
                <span className="text-2xl font-black text-cyan-400">
                  {formatUZS(product.price_uzs)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">1688 / Taobao:</span>
                <span className="text-lg font-bold text-amber-400">{product.price_cny} ¥</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-slate-400 block">Minimal Buyurtma:</span>
                <span className="font-bold text-white text-sm">{product.moq} ta</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-slate-400 block">Ombor Holati:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {product.stock_status === 'instock' ? 'Mavjud' : 'Tugagan'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-2">
            <Link
              href="/"
              className="w-full py-3.5 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              Katalogda Ko'rish / Savatga Qo'shish
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
