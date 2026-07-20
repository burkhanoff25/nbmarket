// cjApi.js
// CJ Dropshipping API client for syncing Taobao products.
// Supports live credentials (via environment variables) and a mock fallback layer.

const fs = require('fs');
const path = require('path');
const { fetchFrom1688 } = require('./apifyClient');

const CJ_API_URL = 'https://developers.cjdropshipping.com';

// Removed mockTaobaoDatabase as requested
class CJAPIClient {
  constructor() {
    this.email = process.env.CJ_EMAIL || null;
    this.apiKey = process.env.CJ_API_KEY || null;
    this.accessToken = null;
  }

  // Obtains Access Token from CJ Developers Hub
  async authenticate() {
    if (!this.email || !this.apiKey) {
      console.log('[CJ API Client] No credentials provided for CJ API.');
      return false;
    }

    try {
      const response = await fetch(`${CJ_API_URL}/api/v2/authentication/getAccessToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.email,
          apiKey: this.apiKey
        }),
        signal: AbortSignal.timeout(8000)
      });

      const data = await response.json();
      if (data.code === 200 && data.data) {
        this.accessToken = data.data.accessToken;
        console.log('[CJ API Client] Authenticated successfully.');
        return true;
      } else {
        console.error('[CJ API Client] Authentication failed:', data.message);
        return false;
      }
    } catch (err) {
      console.error('[CJ API Client] Connection to CJ API failed:', err.message);
      return false;
    }
  }

  // Fetches products list (filters source platform for Taobao)
  async fetchTaobaoProducts(searchTerm = '', page = 1, limit = 10) {
    // 1. Try real 1688 data via Apify first — no Chinese business registration needed.
    const apifyResult = await fetchFrom1688(searchTerm, limit);
    if (apifyResult.success && apifyResult.products.length > 0) {
      console.log('[CJ API Client] Using REAL 1688 data from Apify.');
      return {
        success: true,
        products: apifyResult.products,
        total: apifyResult.products.length,
        page,
        totalPages: 1
      };
    }

    // 2. Fall back to CJ Dropshipping live API if credentials exist.
    const hasLiveAuth = await this.authenticate();
    if (!hasLiveAuth) {
      console.error('[CJ API Client] No Apify or CJ credentials available to fetch real data.');
      return { success: false, error: 'No API credentials available', products: [] };
    }

    // Live API Call to CJ Dropshipping Products Sourcing List
    try {
      const response = await fetch(`${CJ_API_URL}/api/v2/product/list?pageNumber=${page}&pageSize=${limit}&searchKey=${encodeURIComponent(searchTerm)}&sourceType=Taobao`, {
        headers: {
          'CJ-Access-Token': this.accessToken
        },
        signal: AbortSignal.timeout(10000)
      });

      const data = await response.json();
      if (data.code === 200 && data.data) {
        // Map CJ response format to our structured format
        const mappedProducts = (data.data.list || []).map(item => ({
          id: `taobao_${item.pid}`,
          source_id: `TB_${item.pid}`,
          name_original: item.productNameCn || item.productName || '',
          name_uz: item.productNameEn || '', // Will be processed by translator pipeline
          description_uz: item.description || 'Taobao mahsulot tavsifi.',
          category: item.categoryName || 'Boshqa / mavsumiy',
          price_cny: parseFloat(item.productPrice || 0),
          images: item.productImage ? [item.productImage] : [],
          stock_status: 'instock',
          rating: 4.8,
          moq: 1
        }));

        return {
          success: true,
          products: mappedProducts,
          total: data.data.totalRecord || mappedProducts.length,
          page,
          totalPages: data.data.totalPage || 1
        };
      } else {
        throw new Error(data.message || 'Unknown API error');
      }
    } catch (err) {
      console.error('[CJ API Client] Failed to fetch live products:', err.message);
      return { success: false, error: err.message, products: [] };
    }
  }
}

module.exports = new CJAPIClient();
