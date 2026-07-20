<div align="center">
  <img src="./public/nb_market_banner.png" alt="NB Market Banner" width="100%" style="border-radius: 12px; margin-bottom: 20px;" />

  # 🛒 NB Market
  **Taobao orqali O'zbekistonga to'g'ridan-to'g'ri dropshipping platformasi.**
  
  [![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)]()
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)]()
  [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)]()
  [![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)]()

  <p align="center">
    Loyihani joylashtirish, ishga tushirish va boshqarish haqida to'liq qo'llanma.
  </p>
</div>

---

## 🌟 Loyiha Haqida (Project Overview)

**NB Market** — bu Taobao platformasidagi mahsulotlarni real vaqt rejimida qabul qilib oluvchi, O'zbek tiliga o'girib, narxlarni so'mga (UZS) konvertatsiya qilib mijozlarga taqdim etuvchi ilg'or savdo katalogi (dropshipping) tizimi. 

Premium **Glassmorphism** dizayn, to'liq mobil-moslashuv (responsive) va yuqori tezlikka ega.

<div align="center">
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/65dea6c4eaca7da319e552c09f4cf5a9a8dab2c8/icons/React-Dark.svg" width="40" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/65dea6c4eaca7da319e552c09f4cf5a9a8dab2c8/icons/NodeJS-Dark.svg" width="40" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/65dea6c4eaca7da319e552c09f4cf5a9a8dab2c8/icons/SQLite.svg" width="40" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/65dea6c4eaca7da319e552c09f4cf5a9a8dab2c8/icons/ExpressJS-Dark.svg" width="40" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/65dea6c4eaca7da319e552c09f4cf5a9a8dab2c8/icons/CSS.svg" width="40" />
</div>

---

## ✨ Imkoniyatlar (Features)

| 🎯 Kategoriya | 🛠️ Funksionallik |
| :--- | :--- |
| **Integratsiya** | Taobao API orqali maxsulotlarni avtomatik tortish. |
| **Tarjima** | Ma'lumotlarni, mahsulot nomlari va tafsilotlarini O'zbek tiliga avtomat o'girish. |
| **Moliya** | Xitoy Yuanini (CNY) O'zbek So'miga (UZS) kurs asosida hisoblash va ustama qo'shish. |
| **Dizayn** | Premium "Glassmorphism" UI, zamonaviy shriftlar, silliq animatsiyalar. |
| **Boshqaruv** | Maxfiy Admin Panel: maxsulotlarni moderatsiya qilish, tahrirlash, tasdiqlash va o'chirish. |
| **Mediya** | Rasmlarni WebP formatiga siqib (optimization) serverda saqlash va tezkor ko'rsatish. |

---

## 🏗️ Arxitektura (Architecture)

Loyiha **Monorepo** ko'rinishida tashkil etilgan.

* 📁 `/frontend` - **Vite + React.js** yordamida yozilgan foydalanuvchi interfeysi (UI).
* 📁 `/public/images` - Yuklab olingan barcha mahsulot rasmlari (WebP optimizatsiya qilingan).
* 📄 `server.js` - **Express.js** backend xizmati va API marshrutizatori.
* 📄 `pipeline.js` - Taobao dan kelgan xom datani qayta ishlash xizmati.
* 📄 `market.db` - **SQLite3** ma'lumotlar bazasi (500+ mahsulot bilan birga).

---

## 🚀 O'rnatish va Ishga tushirish (Local Development)

Loyihani o'z kompyuteringizda ishga tushirish uchun quyidagi qadamlarni bajaring:

### 1️⃣ Repozitoriyni ko'chirib olish
\`\`\`bash
git clone https://github.com/burkhanoff25/nbmarket.git
cd nbmarket
\`\`\`

### 2️⃣ Bog'liqliklarni o'rnatish (Dependencies)
\`\`\`bash
# Asosiy backend kutubxonalarni o'rnatish
npm install

# Frontend kutubxonalarni o'rnatish
cd frontend
npm install
cd ..
\`\`\`

### 3️⃣ Muhit o'zgaruvchilari (Environment Variables)
Root papkada \`.env\` faylini yarating va quyidagi kodlarni joylang:
\`\`\`env
PORT=5000
APIFY_API_TOKEN=your_apify_api_token_here
\`\`\`

### 4️⃣ Serverni ishga tushirish
Ilovani bir vaqtning o'zida ishga tushirish (Frontend Vite dev-server va Backend Express server):
\`\`\`bash
npm run dev
\`\`\`
👉 Endi platforma: **http://localhost:5173** (Frontend) va **http://localhost:5000** (Backend API) da ishlaydi.

---

## ☁️ Vercel'ga Joylashtirish (Deployment)

Loyiha to'liq [Vercel](https://vercel.com/) uchun moslashtirilgan. Barcha sozlamalar \`vercel.json\` faylida kiritilgan. Vercel avtomat tarzda React'ni (Frontend) quradi va \`server.js\` ni "Serverless Function" (Backend) sifatida ishga tushiradi.

**Vercel cheklovlari haqida ogohlantirish (Serverless):**
> ⚠️ Vercel'da **Serverless** muhit "Read-Only" (Faqat O'qish uchun) formatda ishlaydi. Hozirda mavjud 500+ mahsulotni ko'rish va tizimdan foydalanish bemalol ishlaydi. Ammo, admin panel orqali yangi mahsulotlarni qo'shish, rasmlarni yuklab olish yoki databazani (market.db) tahrirlash kabi "Write" (Yozish) funksiyalari o'zgarishlarni saqlab qolmaydi. To'liq yozish funksiyalari ishlashi uchun kelgusida ma'lumotlar bazasini PostgreSQL ga o'tkazish tavsiya etiladi.

### Qanday deploy qilinadi:
1. Github repozitoriyangizni Vercel platformasiga ulang.
2. Vercel dashboard'dan "Import Project" ni bosing.
3. **Framework Preset** qismini "**Other**" da qoldiring (Vercel avtomat tarzda \`vercel.json\` dan o'qiydi).
4. \`Deploy\` tugmasini bosing! 🚀

---

## 📬 Litsenziya & Kontakt
This project is proprietary and built specifically for **NB Market**.  
<br/>
<div align="center">
  <i>Developed with ❤️ using React, Express, and SQLite</i>
</div>
