---
name: product-poster-fix
description: >
  Mahsulot kartochkalari (poster/card) ko'rinishi xunuk yoki buzilgan bo'lsa ishlatiladi.
  Trigger: "poster xunuk", "card yomon ko'rinadi", "UI to'g'irla", "dizayn fix", "ko'rinish yaxshila",
  "antigravity", "kartochka to'g'irla" kabi so'zlar ishlatilganda. MUHIM: har doim avval loyiha
  strukturasi va browser konsolini tekshiradi, faqat xato yo'qligini bilgandan so'ng o'zgartirish kiritadi.
  Bitta ishda faqat BITTA xatoni hal qiladi.
sources: [chat]
---

# Product Poster / Card UI Fixer Skill

## Asosiy Qoida (O'ZGARTIRMA)
> **HECH QACHON** bitta sessiyada bir nechta xatoni bir vaqtda tuzatma.
> **HAR DOIM** avval tekshir, keyin o'zgartir.
> **HAR BIR** o'zgarishdan keyin browser konsolini qayta tekshir.

---

## 1-Qadam: Loyihani To'liq Tekshirish (MAJBURIY)

Biron narsa o'zgartirishdan OLDIN quyidagilarni bajar:

```bash
# 1. Loyiha strukturasini ko'r
find . -type f -name "*.tsx" -o -name "*.jsx" -o -name "*.vue" -o -name "*.css" \
  | grep -i -E "card|product|catalog|poster|item" | head -20

# 2. Package.json ni tekshir
cat package.json | grep -E "scripts|dependencies" -A 20

# 3. Dev server ishlayaptimi?
# Foydalanuvchidan so'ra: "localhost:5173 da xato bormi?"
# Foydalanuvchi "yo'q" desa - davom et
# Foydalanuvchi "ha" desa - avval o'sha xatoni tuzat
```

**FOYDALANUVCHIDAN SO'RA:**
"Browser konsolida (F12 > Console) hozir qizil xato bormi? Ha yoki yo'q?"

Javob **YO'Q** bo'lsa — 2-qadam ga o't.
Javob **HA** bo'lsa — avval o'sha xatoni tuzat, keyin davom et.

---

## 2-Qadam: Muammo Komponentini Topi

```bash
# Kartochka komponentini top
grep -r "ProductCard\|ItemCard\|CatalogCard\|poster\|card" src/ \
  --include="*.tsx" --include="*.jsx" --include="*.vue" -l

# Asosiy faylni o'qi
cat src/components/ProductCard.tsx  # yoki topilgan fayl nomi
```

Quyidagilarga e'tibor ber:
- `img` teglari: `object-fit`, `width`, `height` belgilangan?
- Rasm konteyneri: `overflow: hidden` bormi?
- `aspect-ratio` yoki fixed height bormi?

---

## 3-Qadam: Xunuk Ko'rinishning Keng Tarqalgan Sabablari

### ❌ Muammo 1: Rasm cho'zilgan/buzilgan
```css
/* NOTO'G'RI */
img { width: 100%; height: 100%; }

/* TO'G'RI */
img {
  width: 100%;
  height: 200px;          /* yoki kerakli balandlik */
  object-fit: contain;    /* rasm nisbatini saqlaydi */
  background: #1a1a2e;    /* orqa fon */
}
```

### ❌ Muammo 2: Har xil o'lchamdagi kartochkalar
```css
/* TO'G'RI - barcha kartochka bir xil bo'lishi uchun */
.product-card {
  display: flex;
  flex-direction: column;
  height: 100%;           /* grid ichida teng bo'ladi */
}

.product-card .image-wrapper {
  aspect-ratio: 1 / 1;   /* kvadrat rasm maydoni */
  overflow: hidden;
  background: #f5f5f5;
}
```

### ❌ Muammo 3: Rasm foni qorayib ko'rinadi (dark mode)
```css
.image-wrapper {
  background-color: #ffffff;  /* oq fon rasmlar uchun */
  /* yoki */
  background-color: #1e1e2e;  /* dark theme uchun */
}
```

### ❌ Muammo 4: Grid noto'g'ri
```css
/* TO'G'RI grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  align-items: stretch;   /* muhim! */
}
```

---

## 4-Qadam: O'zgartirish Kiritish

**FAQAT BITTA muammoni hal qil.**

```bash
# Faylni o'qi
cat src/components/ProductCard.tsx

# O'zgartir (str_replace ishlat, butun faylni qayta yozma)
# str_replace: faqat muammoli qismni almashtir
```

O'zgartirishdan keyin:
```
Foydalanuvchiga ayt: "O'zgartirish kiritdim. Iltimos brauzerni yangilab (Ctrl+R) ko'ring va
konsolda xato bormi bildiring."
```

---

## 5-Qadam: Tasdiqlash

Foydalanuvchi "yaxshi ko'rinmoqda" desa — STOP. Ko'proq o'zgartirma.
Foydalanuvchi "hali ham xunuk" desa — **2-qadam**dan qayta boshlang, yangi muammoni top.

---

## TAQIQLANGAN HARAKATLAR

- ❌ Bir vaqtda 2+ fayl o'zgartirish
- ❌ Browser xatosi borligini bilmasdan o'zgartirish
- ❌ `object-fit: cover` ishlatish (rasm qirqilib qoladi)
- ❌ Butun faylni qayta yozish (faqat kerakli qismni o'zgartir)
- ❌ Foydalanuvchidan tasdiq olmay keyingi muammoga o'tish

## RUXSAT ETILGAN

- ✅ `object-fit: contain` — rasm to'liq ko'rinadi
- ✅ `aspect-ratio` — proporsiya saqlaydi
- ✅ `overflow: hidden` — rasm konteynerdan chiqib ketmaydi
- ✅ Fixed height + `object-fit: contain` — eng ishonchli yechim
