import * as cheerio from 'cheerio';
import { detectMarketplaceSource, type MarketplaceSource } from './marketplace-sources.js';

export type SourceProduct = {
  source: MarketplaceSource;
  name: string;
  description: string | null;
  productUrl: string;
  sourceUrl: string;
  imageUrl: string | null;
  price: number | null;
  currency: string | null;
};

function absUrl(value: string | undefined, base: string) {
  if (!value) return null;
  try { return new URL(value, base).toString(); } catch { return null; }
}

function firstMeta($: cheerio.CheerioAPI, selectors: string[]) {
  for (const selector of selectors) {
    const v = $(selector).attr('content') || $(selector).attr('href');
    if (v?.trim()) return v.trim();
  }
  return null;
}

function firstText($: cheerio.CheerioAPI, selectors: string[]) {
  for (const selector of selectors) {
    const v = $(selector).first().text().replace(/\s+/g, ' ').trim();
    if (v) return v;
  }
  return null;
}

export async function fetchProductPage(url: string): Promise<SourceProduct> {
  const source = detectMarketplaceSource(url);
  if (!source) throw new Error('Unsupported marketplace source');
  const res = await fetch(url, { headers: { 'user-agent': 'LUMIA-Marketplace-Importer/1.0' } });
  if (!res.ok) throw new Error(`Source returned HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const name = firstMeta($, ['meta[property="og:title"]','meta[name="twitter:title"]']) || firstText($,['h1','title']);
  const description = firstMeta($,['meta[property="og:description"]','meta[name="description"]']);
  const imageRaw = firstMeta($,['meta[property="og:image"]','meta[name="twitter:image"]']);
  const imageUrl = absUrl(imageRaw || undefined, url);
  const priceRaw = firstMeta($,['meta[property="product:price:amount"]','meta[itemprop="price"]']);
  const currency = firstMeta($,['meta[property="product:price:currency"]','meta[itemprop="priceCurrency"]']);
  const price = priceRaw ? Number(String(priceRaw).replace(/[^0-9.]/g,'')) : null;

  if (!name || !imageUrl) throw new Error('Exact product name and image URL were not found on the source page');

  return {
    source,
    name,
    description,
    productUrl: url,
    sourceUrl: url,
    imageUrl,
    price: Number.isFinite(price) ? price : null,
    currency
  };
}
