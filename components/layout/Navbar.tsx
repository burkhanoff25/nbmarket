'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, LayoutDashboard, Search, Store, ShieldCheck, User } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const totalCartCount = useCartStore((state) => state.getTotalCount());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0f172a]/90 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                NB Market
              </span>
              <span className="block text-[10px] text-cyan-400/80 tracking-wider font-semibold uppercase">
                1688 & Taobao Direct
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-3">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                pathname === '/'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Katalog</span>
            </Link>

            <Link
              href="/admin"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                pathname === '/admin'
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin Panel</span>
            </Link>

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <span className="hidden sm:inline text-sm font-medium">Savat</span>
              {mounted && totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* Auth Link */}
            <Link
              href="/login"
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-colors"
              title="Kirish / Profil"
            >
              <User className="w-5 h-5" />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
