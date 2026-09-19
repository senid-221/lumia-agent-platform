export type MarketplaceSource = 'amazon' | 'aliexpress' | 'alibaba' | 'shopify';

export const MARKETPLACE_SOURCE_POLICIES: Record<MarketplaceSource, {
  name: string;
  mode: 'manual_or_api' | 'api_or_storefront';
  requiresExactProductUrl: boolean;
  requiresImageUrl: boolean;
}> = {
  amazon: { name: 'Amazon', mode: 'manual_or_api', requiresExactProductUrl: true, requiresImageUrl: true },
  aliexpress: { name: 'AliExpress', mode: 'manual_or_api', requiresExactProductUrl: true, requiresImageUrl: true },
  alibaba: { name: 'Alibaba', mode: 'manual_or_api', requiresExactProductUrl: true, requiresImageUrl: true },
  shopify: { name: 'Shopify', mode: 'api_or_storefront', requiresExactProductUrl: true, requiresImageUrl: true }
};

export function detectMarketplaceSource(url: string): MarketplaceSource | null {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes('amazon.')) return 'amazon';
    if (host.includes('aliexpress.')) return 'aliexpress';
    if (host.includes('alibaba.')) return 'alibaba';
    if (host.includes('myshopify.') || host.includes('shopify.')) return 'shopify';
    return null;
  } catch {
    return null;
  }
}

export function validateMarketplaceSource(url: string, imageUrl: string): {
  source: MarketplaceSource | null;
  valid: boolean;
  reason?: string;
} {
  const source = detectMarketplaceSource(url);
  if (!source) return { source: null, valid: false, reason: 'Unsupported marketplace source' };
  try {
    const image = new URL(imageUrl);
    if (!['http:', 'https:'].includes(image.protocol)) return { source, valid: false, reason: 'Image URL must be HTTP(S)' };
  } catch {
    return { source, valid: false, reason: 'Invalid image URL' };
  }
  return { source, valid: true };
}
