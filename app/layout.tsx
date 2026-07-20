import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: "NB Market — 1688 & Taobao Dropshipping E-Commerce",
  description: "Xitoyning 1688 va Taobao mahsulotlarini o'zbek tilida, so'mda va kafolat bilan buyurtma qiling.",
  keywords: ["1688", "taobao", "dropshipping", "uzbekistan", "ecommerce", "nb market"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className="bg-[#0b0f19] text-[#f8fafc] antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-white/10 bg-[#0f172a]/80 py-6 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} NB Market. Barcha huquqlar himoyalangan.</p>
        </footer>
      </body>
    </html>
  );
}
