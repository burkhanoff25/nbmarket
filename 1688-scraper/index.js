require('dotenv').config();
const { ApifyClient } = require('apify-client');
const { program } = require('commander');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');

// CLI parametrlarini sozlash
program
  .option('-k, --keyword <type>', 'Kalit so\'z (keyword) bo\'yicha qidirish')
  .option('-p, --pages <number>', 'Qidiriladigan sahifalar soni (maxPages)', 1)
  .option('--price-start <number>', 'Boshlang\'ich narx (min price)')
  .option('--price-end <number>', 'Yakuniy narx (max price)')
  .parse(process.argv);

const options = program.opts();

if (!options.keyword) {
  console.error('Xatolik: --keyword parametri kiritilishi shart. Masalan: node index.js --keyword "shoes"');
  process.exit(1);
}

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;

if (!APIFY_API_TOKEN) {
  console.error('Xatolik: APIFY_API_TOKEN muhit o\'zgaruvchisida topilmadi.');
  console.error('Iltimos, .env faylini yarating va tokenni kiriting. Qo\'shimcha ma\'lumot uchun README.md ni o\'qing.');
  process.exit(1);
}

// Apify mijozini initsializatsiya qilish
const client = new ApifyClient({
    token: APIFY_API_TOKEN,
});

async function main() {
    try {
        console.log(`"${options.keyword}" bo'yicha ma'lumotlar qidirilmoqda...`);
        
        // Apify platformasidagi 1688 qidiruv Actor'i ID'si. 
        // Bu o'zgarishi mumkin bo'lgan universal scraperlardan biri.
        const actorId = 'epctex/1688-scraper';
        
        // Actor qabul qiladigan parametrlar
        const input = {
            keyword: options.keyword,
            maxPages: parseInt(options.pages),
            priceStart: options.priceStart ? parseFloat(options.priceStart) : undefined,
            priceEnd: options.priceEnd ? parseFloat(options.priceEnd) : undefined
        };

        console.log('Apify API orqali so\'rov yuborilmoqda. Iltimos kuting (bu bir necha daqiqa olishi mumkin)...');
        
        // Actor'ni ishga tushirish va u tugashini kutish
        const run = await client.actor(actorId).call(input);

        console.log('Ma\'lumotlar yig\'ildi! Natijalar olinmoqda...');
        
        // Natijalarni yig'ish (dataset'dan olish)
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        if (items.length === 0) {
            console.log("Hech qanday mahsulot topilmadi.");
            return;
        }

        // Qaytgan JSON natijani tozalab, oddiy massivga aylantirish
        // title, price, seller, moq, imageUrl, salesCount
        const cleanedData = items.map(item => {
            return {
                title: item.title || item.subject || 'Noma\'lum',
                price: item.price || item.priceInfo?.price || item.offerPrice || 'Noma\'lum',
                seller: item.company?.name || item.sellerName || item.shopName || item.supplierInfo?.companyName || 'Noma\'lum',
                moq: item.moq || item.priceInfo?.minOrderQuantity || item.minOrderQuantity || 'Noma\'lum',
                imageUrl: item.image || item.imageUrl || item.imgUrl || (item.images && item.images[0]) || 'Noma\'lum',
                salesCount: item.salesCount || item.sold || item.monthSold || item.sellsCount || 'Noma\'lum'
            };
        });

        console.log(`${cleanedData.length} ta mahsulot topildi. CSV faylga saqlanmoqda...`);

        // Natijani CSV faylga eksport qilish
        const csvWriter = createObjectCsvWriter({
            path: 'natija.csv',
            header: [
                {id: 'title', title: 'Title'},
                {id: 'price', title: 'Price'},
                {id: 'seller', title: 'Seller'},
                {id: 'moq', title: 'MOQ'},
                {id: 'imageUrl', title: 'Image URL'},
                {id: 'salesCount', title: 'Sales Count'}
            ]
        });

        await csvWriter.writeRecords(cleanedData);
        console.log('Muvaffaqiyatli saqlandi! Natijalarni loyiha papkasidagi "natija.csv" faylidan ko\'rishingiz mumkin.');

    } catch (error) {
        // Xatoliklarni ushlash va aniq xabarlar chiqarish
        if (error.message && (error.message.includes('token') || error.message.includes('Unauthorized') || error.message.includes('401'))) {
            console.error('\n[XATOLIK] API token noto\'g\'ri yoki muddati tugagan.');
            console.error('Iltimos, .env fayldagi APIFY_API_TOKEN to\'g\'riligini tekshiring va qaytadan urinib ko\'ring.\n');
        } else {
            console.error('\n[XATOLIK] Kutilmagan xatolik yuz berdi:', error.message, '\n');
        }
    }
}

main();
