export const MARKETPLACE_SOURCE_POLICIES = {
  amazon: { name: 'Amazon', mode: 'manual_or_api', requiresExactProductUrl: true, requiresImageUrl: true },
  aliexpress: { name: 'AliExpress', mode: 'manual_or_api', requiresExactProductUrl: true, requiresImageUrl: true },
  alibaba: { name: 'Alibaba', mode: 'manual_or_api', requiresExactProductUrl: true, requiresImageUrl: true },
  shopify: { name: 'Shopify', mode: 'api_or_storefront', requiresExactProductUrl: true, requiresImageUrl: true }
} as const;
