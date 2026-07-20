// apifyClient.js
// Fetches REAL 1688.com product data (including real image URLs) via Apify.
// Requires APIFY_API_TOKEN and APIFY_1688_ACTOR_ID in your .env file.
// No Chinese business registration needed — this is the fast path.

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN || null;
const APIFY_1688_ACTOR_ID = process.env.APIFY_1688_ACTOR_ID || null;

async function fetchFrom1688(searchTerm = '', maxItems = 10) {
  if (!APIFY_API_TOKEN || !APIFY_1688_ACTOR_ID) {
    console.log('[Apify Client] Missing APIFY_API_TOKEN or APIFY_1688_ACTOR_ID in .env. Skipping.');
    return { success: false, products: [] };
  }

  // run-sync-get-dataset-items = runs the actor and waits for the result in one call.
  // Simplest way to call an Apify actor without managing runs/webhooks yourself.
  const url = `https://api.apify.com/v2/acts/${APIFY_1688_ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}`;

  const input = {
    search: searchTerm || 'mahsulot',
    maxItems: maxItems
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(60000) // scraping takes longer than a normal API call
    });

    if (!response.ok) {
      throw new Error(`Apify HTTP status ${response.status}`);
    }

    const items = await response.json();

    if (!Array.isArray(items) || items.length === 0) {
      console.warn('[Apify Client] No items returned for keyword:', searchTerm);
      return { success: true, products: [] };
    }

    // NOTE: field names below (title, price, imageUrl, images, etc.) depend on
    // the exact Apify actor you picked. Log one raw item first and adjust the
    // mapping to match what your actor actually returns:
    //   console.log(JSON.stringify(items[0], null, 2));
    const mapped = items.slice(0, maxItems).map((item, idx) => {
      const rawImages = item.images || item.imageList || (item.imageUrl ? [item.imageUrl] : []) || [];

      return {
        id: `taobao_${item.offerId || item.id || idx}`,
        source_id: `1688_${item.offerId || item.id || idx}`,
        name_original: item.title || item.subject || item.productTitle || '',
        name_uz: `Xitoydan keltirilgan ajoyib ${item.title || 'mahsulot'} hamyonbop narxda original sifatli`,
        description_uz: `Bu mahsulot to'g'ridan-to'g'ri Xitoydan keltirilgan bo'lib, yuqori sifat va arzon narxni kafolatlaydi. Ushbu zamonaviy va sifatli mahsulot orqali siz o'z ehtiyojlaringizni to'liq qondirishingiz mumkin. Har bir qadoq xavfsiz va ishonchli tarzda yetkazib beriladi. Bizning xizmatimiz eng yaxshi natijani beradi va sizning ishonchingizni oqlashga harakat qilamiz. Hozirgi kunda eng ko'p sotilayotgan noyob mahsulotlardan biridir. Buni o'tkazib yubormang, tezroq buyurtma bering va sifatdan zavqlaning.`,
        category: item.categoryName || 'Boshqa / mavsumiy',
        price_cny: parseFloat(item.price || item.priceMin || item.priceInfo?.price || 0),
        images: rawImages, // <-- REAL 1688 image URLs, not picsum placeholders
        stock_status: 'instock',
        rating: parseFloat(item.rating || 4.5),
        moq: parseInt(item.moq || item.minimumOrderQuantity || item.minOrderQuantity || 1, 10)
      };
    });

    return { success: true, products: mapped };
  } catch (err) {
    console.error('[Apify Client] Failed to fetch live 1688 products:', err.message);
    return { success: false, error: err.message, products: [] };
  }
}

module.exports = { fetchFrom1688 };
