'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { formatUZS } from '@/lib/utils';
import { CheckCircle2, ArrowLeft, CreditCard, MapPin, User, Phone } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, getTotalPriceUzs, clearCart } = useCartStore();
  const [submitted, setSubmitted] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'click' | 'payme' | 'cash'>('click');

  const totalPrice = getTotalPriceUzs();

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      alert("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }
    setSubmitted(true);
    clearCart();
  };

  if (submitted) {
    return (
      <div className="my-16 text-center max-w-md mx-auto space-y-6 bg-[#151c2c] border border-white/10 p-8 rounded-3xl shadow-2xl animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Buyurtmangiz Qabul Qilindi!</h2>
          <p className="text-sm text-slate-300">
            Operatormiz tez orada <strong className="text-cyan-400">{phone}</strong> raqamingizga qo'ng'iroq qilib buyurtmani tasdiqlaydi.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Bosh sahifaga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 my-6 animate-fade-in max-w-3xl mx-auto">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Savatga qaytish
      </Link>

      <div className="bg-[#151c2c] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        <h1 className="text-2xl font-bold text-white">Buyurtmani Rasmiylashtirish</h1>

        <form onSubmit={handleSubmitOrder} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-cyan-400" />
                Ism va Familiya:
              </label>
              <input
                type="text"
                required
                placeholder="Masalan: Alisher Navoiy"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-white/15 text-white text-sm outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-cyan-400" />
                Telefon Raqam:
              </label>
              <input
                type="tel"
                required
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-white/15 text-white text-sm outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Yetkazib Berish Manzili:
              </label>
              <textarea
                required
                rows={3}
                placeholder="Shahar, tuman, ko'cha, uy raqami..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-white/15 text-white text-sm outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            {/* Payment Options */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                To'lov Usuli:
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('click')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    paymentMethod === 'click'
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Click
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('payme')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    paymentMethod === 'payme'
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Payme
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    paymentMethod === 'cash'
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Naqd
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between">
            <span className="text-sm text-slate-300">To'lanadigan Jami Summa:</span>
            <span className="text-xl font-extrabold text-cyan-400">{formatUZS(totalPrice)}</span>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 transition-all"
          >
            Buyurtmani Tasdiqlash
          </button>
        </form>
      </div>
    </div>
  );
}
