import { db } from './db.js';

export type MarketplaceCatalogItem = {
  name: string;
  category: string;
  priceRwf: number;
  productUrl: string;
  sourceShop: string;
  sourceUrl: string;
  verifiedAt: string;
};

export const VERIFIED_RW_CATALOG: MarketplaceCatalogItem[] = [
  { name: 'IPHONE 16E', category: 'Mobile Phones', priceRwf: 1300000, productUrl: 'https://bmgadgets.com/product/iphone-16e/', sourceShop: 'BM Gadgets', sourceUrl: 'https://bmgadgets.com/product-category/phones/', verifiedAt: '2026-09-19' },
  { name: 'IPHONE 16PRO', category: 'Mobile Phones', priceRwf: 1910000, productUrl: 'https://bmgadgets.com/product/iphone-16pro/', sourceShop: 'BM Gadgets', sourceUrl: 'https://bmgadgets.com/product-category/phones/', verifiedAt: '2026-09-19' },
  { name: 'IPHONE 16PROMAX (256GB)', category: 'Mobile Phones', priceRwf: 2300000, productUrl: 'https://bmgadgets.com/product/iphone-16promax256/', sourceShop: 'BM Gadgets', sourceUrl: 'https://bmgadgets.com/product-category/phones/', verifiedAt: '2026-09-19' },
  { name: 'IPHONE 16PROMAX (512GB)', category: 'Mobile Phones', priceRwf: 2500000, productUrl: 'https://bmgadgets.com/product/iphone-16promax512/', sourceShop: 'BM Gadgets', sourceUrl: 'https://bmgadgets.com/product-category/phones/', verifiedAt: '2026-09-19' },
  { name: 'OPPO A18', category: 'Mobile Phones', priceRwf: 240000, productUrl: 'https://bmgadgets.com/product/oppo-a18/', sourceShop: 'BM Gadgets', sourceUrl: 'https://bmgadgets.com/product-category/phones/', verifiedAt: '2026-09-19' },
  { name: 'OPPO A38', category: 'Mobile Phones', priceRwf: 250000, productUrl: 'https://bmgadgets.com/product/oppo-a38/', sourceShop: 'BM Gadgets', sourceUrl: 'https://bmgadgets.com/product-category/phones/', verifiedAt: '2026-09-19' },
  { name: 'OPPO A5PRO', category: 'Mobile Phones', priceRwf: 350000, productUrl: 'https://bmgadgets.com/product/oppo-a5pro/', sourceShop: 'BM Gadgets', sourceUrl: 'https://bmgadgets.com/product-category/phones/', verifiedAt: '2026-09-19' },
  { name: 'SAMSUNG GALAXY A05 (64GB)', category: 'Mobile Phones', priceRwf: 170000, productUrl: 'https://bmgadgets.com/product/samsung-galaxy-a05-64/', sourceShop: 'BM Gadgets', sourceUrl: 'https://bmgadgets.com/product-category/phones/', verifiedAt: '2026-09-19' },
  { name: 'SAMSUNG GALAXY A05s (128GB)', category: 'Mobile Phones', priceRwf: 230000, productUrl: 'https://bmgadgets.com/product/samsung-galaxy-a05s-128/', sourceShop: 'BM Gadgets', sourceUrl: 'https://bmgadgets.com/product-category/phones/', verifiedAt: '2026-09-19' },
  { name: 'SAMSUNG GALAXY A06 (64GB)', category: 'Mobile Phones', priceRwf: 180000, productUrl: 'https://bmgadgets.com/product/samsung-galaxy-a06-64/', sourceShop: 'BM Gadgets', sourceUrl: 'https://bmgadgets.com/product-category/phones/', verifiedAt: '2026-09-19' },
  { name: 'SAMSUNG GALAXY A06 (128GB)', category: 'Mobile Phones', priceRwf: 210000, productUrl: 'https://bmgadgets.com/product/samsung-galaxy-a06-128/', sourceShop: 'BM Gadgets', sourceUrl: 'https://bmgadgets.com/product-category/phones/', verifiedAt: '2026-09-19' },

  { name: 'Receipt Printer, 80mm Thermal Printer', category: 'Desktops', priceRwf: 130000, productUrl: 'https://tap.rw/store/product/receipt-printer-80mm-thermal-printer-12525d0f/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/category/electronics/', verifiedAt: '2026-09-19' },
  { name: 'Soundcore by Anker P20i True Wireless Earbuds', category: 'Mobile Phones', priceRwf: 92000, productUrl: 'https://tap.rw/store/product/soundcore-by-anker-p20i-true-wireless-earbuds/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/category/electronics/', verifiedAt: '2026-09-19' },
  { name: 'Used HP EliteDesk 800 G2 Core i5 6400T 2.2GHz 16GB 128GB SSD', category: 'Desktops', priceRwf: 287500, productUrl: 'https://tap.rw/store/tag/refurbished-pc/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/tag/refurbished-pc/', verifiedAt: '2026-09-19' },
  { name: 'Compressed Air Duster-150000RPM', category: 'Computer Repairing', priceRwf: 86500, productUrl: 'https://tap.rw/store/product/compressed-air-duster150000rpm-6353c5a4/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/product/compressed-air-duster150000rpm-6353c5a4/', verifiedAt: '2026-09-19' },
  { name: 'HDMI Switch 4K HDMI Splitter', category: 'Flat Screens', priceRwf: 46000, productUrl: 'https://tap.rw/store/category/electronics/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/category/electronics/', verifiedAt: '2026-09-19' },
  { name: 'Bidirectional HDMI Splitter 2x1 Support HDR, 3D, 4K, 1080P', category: 'Flat Screens', priceRwf: 41500, productUrl: 'https://tap.rw/store/category/electronics/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/category/electronics/', verifiedAt: '2026-09-19' },
  { name: 'USB C Dongle with HDMI, microSD/SD Card Reader, USB C Data Port', category: 'Laptops', priceRwf: 80500, productUrl: 'https://tap.rw/store/product/usb-c-dongle-with-hdmi-microsdsd-card-reader-usb-c-data-port-5417f7f2/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/product/usb-c-dongle-with-hdmi-microsdsd-card-reader-usb-c-data-port-5417f7f2/', verifiedAt: '2026-09-19' },
  { name: '10000mAh USB-C Power Bank', category: 'Mobile Phones', priceRwf: 71500, productUrl: 'https://tap.rw/store/category/electronics/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/category/electronics/', verifiedAt: '2026-09-19' },
  { name: 'Philips OneBlade 360 QP2724/22', category: 'Body oil', priceRwf: 90000, productUrl: 'https://tap.rw/store/tag/featured/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/tag/featured/', verifiedAt: '2026-09-19' },

  { name: 'Braided Sport Elastic Bracelet for Apple Watch', category: 'Mobile covers', priceRwf: 19500, productUrl: 'https://tap.rw/store/tag/featured/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/tag/featured/', verifiedAt: '2026-09-19' },
  { name: 'Fossil chronograph with brown leather strap', category: 'Clothing', priceRwf: 282000, productUrl: 'https://tap.rw/store/tag/featured/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/tag/featured/', verifiedAt: '2026-09-19' },
  { name: 'Afnan 9 PM Night Out Unisex Extrait de Parfum, 3.4 Fl. Oz', category: 'Body oil', priceRwf: 180000, productUrl: 'https://tap.rw/store/tag/featured/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/tag/featured/', verifiedAt: '2026-09-19' },
  { name: 'Dove pH Balanced Body Scrub', category: 'Body oil', priceRwf: 31500, productUrl: 'https://tap.rw/store/deals/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/deals/', verifiedAt: '2026-09-19' },
  { name: 'Minimalist 2% Salicylic Acid Body Wash', category: 'Body oil', priceRwf: 36000, productUrl: 'https://tap.rw/deals/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/deals/', verifiedAt: '2026-09-19' },
  { name: 'Rechargeable fabric Shaver and Lint Remover', category: 'Furniture', priceRwf: 40000, productUrl: 'https://tap.rw/store/tag/fabric-shavers/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/tag/fabric-shavers/', verifiedAt: '2026-09-19' },
  { name: 'Thermos Stainless King Vacuum Insulated Beverage Bottle', category: 'Furniture', priceRwf: 132000, productUrl: 'https://tap.rw/store/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/', verifiedAt: '2026-09-19' },
  { name: 'Resistance Bands for Working Out', category: 'Football', priceRwf: 60000, productUrl: 'https://tap.rw/store/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/', verifiedAt: '2026-09-19' }
];

export async function ensureVerifiedMarketplaceCatalog() {
  const email = process.env.MARKETPLACE_CATALOG_OWNER_EMAIL || 'catalog@lumia.local';
  let user = await db.user.findUnique({ where: { email } });

  if (!user) {
    const bcrypt = await import('bcryptjs');
    user = await db.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(crypto.randomUUID(), 10),
        role: 'ADMIN'
      }
    });
  }

  const partner = await db.partner.upsert({
    where: { userId: user.id },
    update: { businessName: 'LUMIA Verified Marketplace Sources', location: 'Rwanda', status: 'APPROVED' },
    create: {
      userId: user.id,
      businessName: 'LUMIA Verified Marketplace Sources',
      phone: '',
      location: 'Rwanda',
      status: 'APPROVED'
    }
  });

  for (const item of VERIFIED_RW_CATALOG) {
    const id = Buffer.from(item.sourceShop + '|' + item.productUrl).toString('base64url').slice(0, 40);
    await db.product.upsert({
      where: { id },
      update: {
        name: item.name,
        category: item.category,
        priceRwf: item.priceRwf,
        productUrl: item.productUrl,
        sourceShop: item.sourceShop,
        sourceUrl: item.sourceUrl,
        verifiedAt: new Date(item.verifiedAt),
        stock: 1,
        status: 'ACTIVE',
        description: 'Source: ' + item.sourceShop + '. Verified: ' + item.verifiedAt + '.'
      },
      create: {
        id,
        partnerId: partner.id,
        name: item.name,
        category: item.category,
        priceRwf: item.priceRwf,
        productUrl: item.productUrl,
        sourceShop: item.sourceShop,
        sourceUrl: item.sourceUrl,
        verifiedAt: new Date(item.verifiedAt),
        stock: 1,
        status: 'ACTIVE',
        description: 'Source: ' + item.sourceShop + '. Verified: ' + item.verifiedAt + '.'
      }
    });
  }
}
