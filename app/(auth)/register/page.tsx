'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setStoredUser } from '@/lib/auth';
import { Store, Lock, Mail, User, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    const newUser = {
      id: 'usr_' + Date.now(),
      name,
      email,
      role: 'user' as const,
    };

    setStoredUser(newUser, 'dummy_jwt_token_' + Date.now());
    router.push('/');
  };

  return (
    <div className="my-12 max-w-md mx-auto animate-fade-in">
      <div className="bg-[#151c2c] border border-white/10 p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white">Ro'yxatdan O'tish</h1>
          <p className="text-xs text-slate-400">
            NB Market portalida yangi foydalanuvchi hisobini yarating
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-cyan-400" />
              Ismingiz:
            </label>
            <input
              type="text"
              required
              placeholder="Jasur"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-white/15 text-white text-sm outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-cyan-400" />
              Email Pochta:
            </label>
            <input
              type="email"
              required
              placeholder="jasur@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-white/15 text-white text-sm outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-cyan-400" />
              Parol:
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-white/15 text-white text-sm outline-none focus:border-cyan-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <span>Ro'yxatdan O'tish</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/10">
          Hisobingiz bormi?{' '}
          <Link href="/login" className="text-cyan-400 font-bold hover:underline">
            Tizimga kirish
          </Link>
        </div>
      </div>
    </div>
  );
}
