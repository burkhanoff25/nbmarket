'use client';

import React from 'react';
import useSWR from 'swr';
import { getStats } from '@/lib/api';
import { Stats } from '@/types/product';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { ShieldAlert, Package, CheckCircle, Clock, AlertTriangle, Layers } from 'lucide-react';

export default function AdminPage() {
  const { data: stats, mutate: refreshStats } = useSWR<Stats>('/stats', getStats);

  return (
    <div className="space-y-8 my-6 animate-fade-in">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#151c2c] border border-white/10 p-6 rounded-3xl shadow-xl">
        <div>
          <span className="px-3 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold uppercase tracking-wider">
            Admin Management
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            Boshqaruv & Moderatsiya Paneli
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Taobao/1688 API sinxronizatsiyasi faol</span>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-[#151c2c]/80 border border-white/10 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 block">Jami Tovarlar</span>
          <span className="text-2xl font-black text-white">{stats?.total || 0}</span>
        </div>

        <div className="bg-[#151c2c]/80 border border-emerald-500/30 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-emerald-400 block">Tasdiqlangan</span>
          <span className="text-2xl font-black text-emerald-400">{stats?.approved || 0}</span>
        </div>

        <div className="bg-[#151c2c]/80 border border-amber-500/30 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-amber-400 block">Kutilmoqda</span>
          <span className="text-2xl font-black text-amber-400">{stats?.pending || 0}</span>
        </div>

        <div className="bg-[#151c2c]/80 border border-rose-500/30 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-rose-400 block">Xatosi Borlar</span>
          <span className="text-2xl font-black text-rose-400">{stats?.failed || 0}</span>
        </div>

        <div className="bg-[#151c2c]/80 border border-pink-500/30 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-pink-400 block">Rasm Xatosi</span>
          <span className="text-2xl font-black text-pink-400">{stats?.rasm_xatosi || 0}</span>
        </div>

        <div className="bg-[#151c2c]/80 border border-cyan-500/30 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-cyan-400 block">Valyuta Kursi</span>
          <span className="text-xl font-bold text-cyan-400">{stats?.exchange_rate || 1820} UZS</span>
        </div>
      </div>

      {/* Admin Dashboard Core Component */}
      <AdminDashboard stats={stats || null} refreshStats={refreshStats} />
    </div>
  );
}
