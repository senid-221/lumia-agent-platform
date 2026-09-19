import { db } from './db.js';

export type ImportedProduct = {
  name: string;
  category: string;
  priceRwf?: number | null;
  productUrl: string;
  sourceShop: string;
  sourceUrl: string;
  imageUrl?: string | null;
  description?: string | null;
  verifiedAt?: string | null;
  priceStatus?: 'RW_VERIFIED' | 'RW_REFERENCE';
};

function clean(value: string | null | undefined) {
  return (value || '').replace(/\\s+/g, ' ').trim();
}

export function normalizeImportedProduct(input: ImportedProduct) {
  return {
    name: clean(input.name),
    category: clean(input.category),
    priceRwf: input.priceRwf ?? null,
    productUrl: input.productUrl,
    sourceShop: clean(input.sourceShop),
    sourceUrl: input.sourceUrl,
    imageUrl: input.imageUrl || null,
    description: input.description ? clean(input.description) : null,
    verifiedAt: input.verifiedAt ? new Date(input.verifiedAt) : new Date(),
    priceStatus: input.priceStatus || (input.sourceShop.toLowerCase().includes('rwanda') ? 'RW_VERIFIED' : 'RW_REFERENCE')
  };
}

export async function importProductsForPartner(args: { partnerId: string; products: ImportedProduct[] }) {
  if (!args.products.length) return { imported: 0, products: [] };

  const results = [];
  for (const raw of args.products.slice(0, 100)) {
    const p = normalizeImportedProduct(raw);
    if (!p.name || !p.category || !p.productUrl || !p.sourceShop || !p.sourceUrl) continue;
    const existing = await db.product.findFirst({
      where: { partnerId: args.partnerId, productUrl: p.productUrl }
    });
    const data = {
      name: p.name,
      category: p.category,
      priceRwf: p.priceRwf,
      productUrl: p.productUrl,
      sourceShop: p.sourceShop,
      sourceUrl: p.sourceUrl,
      imageUrl: p.imageUrl,
      description: p.description,
      verifiedAt: p.verifiedAt,
      priceStatus: p.priceStatus,
      stock: 1,
      status: 'ACTIVE' as const
    };
    results.push(existing
      ? await db.product.update({ where: { id: existing.id }, data })
      : await db.product.create({ data: { partnerId: args.partnerId, ...data } }));
  }
  return { imported: results.length, products: results };
}
