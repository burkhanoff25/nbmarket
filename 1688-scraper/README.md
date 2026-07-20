# 1688 Product Scraper

Ushbu kichik CLI (Command Line Interface) ilova Apify platformasining 1688 scraper API'si orqali [1688.com](https://1688.com) saytidan mahsulot ma'lumotlarini (nom, narx, sotuvchi, MOQ, rasm, sotuv soni) qidirib va yuklab olish uchun mo'ljallangan. Natijalar avtomatik tarzda tozalangan va oddiy `natija.csv` fayliga saqlanadi.

## Talablar

* [Node.js](https://nodejs.org/) (versiya 14 yoki undan yuqori) o'rnatilgan bo'lishi kerak.
* [Apify](https://apify.com/) platformasidan ro'yxatdan o'tilgan akkaunt.

## O'rnatish

1. Loyiha papkasiga o'ting va kerakli kutubxonalarni o'rnating:
   ```bash
   cd 1688-scraper
   npm install
   ```

2. API tokenni sozlash:
   - [apify.com](https://console.apify.com) saytiga kiring va akkauntga kiring.
   - Apify Console'da chap menyudan **Settings -> Integrations** bo'limiga o'ting.
   - O'zingizning API tokeningizni (Personal API token) nusxalab oling.
   - Loyiha papkasida `.env` nomli fayl (kengaytmasi bilan, nomsiz) yarating. Buning uchun `.env.example` faylidan namuna sifatida foydalanishingiz mumkin.
   - Fayl ichiga tokenni quyidagicha qo'shing:
     ```env
     APIFY_API_TOKEN=sizning_apify_tokeningizni_shu_yerga_joylang
     ```

## Ishlatish

Ilovani terminal yoki buyruqlar satrida quyidagicha ishga tushiring:

```bash
node index.js --keyword "kalit so'z" --pages 2
```

### Qo'shimcha parametrlar (opsiyalar)

* `-k, --keyword <text>`: (Majburiy) 1688 dan izlamoqchi bo'lgan mahsulot kalit so'zi (masalan, "bag", "smart watch").
* `-p, --pages <number>`: (Ixtiyoriy) Skrap qilinadigan sahifalar soni. Standart qiymati: 1.
* `--price-start <number>`: (Ixtiyoriy) Qidiruv uchun minimal narx filtri.
* `--price-end <number>`: (Ixtiyoriy) Qidiruv uchun maksimal narx filtri.

**To'liq misol:**
```bash
node index.js --keyword "smart watch" --pages 3 --price-start 50 --price-end 200
```

Ish tugagandan so'ng (bunga biroz vaqt ketishi mumkin, chunki skraping jarayoni jonli internet sahifalarida bajariladi), barcha tozalangan ma'lumotlar `natija.csv` faylida paydo bo'ladi. Ushbu CSV faylni Microsoft Excel yoki Google Sheets dasturlarida bemalol ochishingiz va tahlil qilishingiz mumkin.

## Xatoliklarni hal qilish

- **API token noto'g'ri xatosi**: Agar token eskirgan bo'lsa yoki `.env` fayl noto'g'ri saqlangan bo'lsa, konsolda aniq ogohlantirish ko'rasiz. Tokenni tekshiring va fayl haqiqatdan ham `.env` deb nomlanganiga ishonch hosil qiling.
- **Hech qanday mahsulot topilmadi**: Kiritilgan kalit so'z bo'yicha hech qanday mahsulot 1688.com da mavjud bo'lmasligi yoki qidiruv tizimi tomonidan rad etilgan bo'lishi mumkin. Boshqa so'z bilan sinab ko'ring.
