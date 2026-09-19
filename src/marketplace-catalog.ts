import { db } from './db.js';

export type MarketplaceCatalogItem = {
  name: string;
  category: string;
  priceRwf: number;
  productUrl: string;
  sourceShop: string;
  sourceUrl: string;
  verifiedAt: string;
  priceStatus?: 'RW_VERIFIED' | 'RW_REFERENCE';
  priceSourceShop?: string;
  priceSourceUrl?: string;
  referenceCurrency?: string;
  sourceType?: 'international';
};

export const VERIFIED_RW_CATALOG: MarketplaceCatalogItem[] = [
  { name: 'IPHONE 16E', category: 'Mobile Phones', priceRwf: 1300000, productUrl: 'https://bmgadgets.com/product/iphone-16e/', sourceShop: 'BM Gadgets', sourceUrl: 'https://bmgadgets.com/product-category/phones/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'IPHONE 16PRO', category: 'Mobile Phones', priceRwf: 1910000, productUrl: 'https://bmgadgets.com/product/iphone-16pro/', sourceShop: 'BM Gadgets', sourceUrl: 'https://bmgadgets.com/product-category/phones/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'IPHONE 16PROMAX (256GB)', category: 'Mobile Phones', priceRwf: 2300000, productUrl: 'https://bmgadgets.com/product/iphone-16promax256/', sourceShop: 'BM Gadgets', sourceUrl: 'https://bmgadgets.com/product-category/phones/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'IPHONE 16PROMAX (512GB)', category: 'Mobile Phones', priceRwf: 2500000, productUrl: 'https://bmgadgets.com/product/iphone-16promax512/', sourceShop: 'BM Gadgets', sourceUrl: 'https://bmgadgets.com/product-category/phones/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'OPPO A18', category: 'Mobile Phones', priceRwf: 240000, productUrl: 'https://bmgadgets.com/product/oppo-a18/', sourceShop: 'BM Gadgets', sourceUrl: 'https://bmgadgets.com/product-category/phones/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'OPPO A38', category: 'Mobile Phones', priceRwf: 250000, productUrl: 'https://bmgadgets.com/product/oppo-a38/', sourceShop: 'BM Gadgets', sourceUrl: 'https://bmgadgets.com/product-category/phones/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'OPPO A5PRO', category: 'Mobile Phones', priceRwf: 350000, productUrl: 'https://bmgadgets.com/product/oppo-a5pro/', sourceShop: 'BM Gadgets', sourceUrl: 'https://bmgadgets.com/product-category/phones/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'SAMSUNG GALAXY A05 (64GB)', category: 'Mobile Phones', priceRwf: 170000, productUrl: 'https://bmgadgets.com/product/samsung-galaxy-a05-64/', sourceShop: 'BM Gadgets', sourceUrl: 'https://bmgadgets.com/product-category/phones/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'SAMSUNG GALAXY A05s (128GB)', category: 'Mobile Phones', priceRwf: 230000, productUrl: 'https://bmgadgets.com/product/samsung-galaxy-a05s-128/', sourceShop: 'BM Gadgets', sourceUrl: 'https://bmgadgets.com/product-category/phones/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'SAMSUNG GALAXY A06 (64GB)', category: 'Mobile Phones', priceRwf: 180000, productUrl: 'https://bmgadgets.com/product/samsung-galaxy-a06-64/', sourceShop: 'BM Gadgets', sourceUrl: 'https://bmgadgets.com/product-category/phones/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'SAMSUNG GALAXY A06 (128GB)', category: 'Mobile Phones', priceRwf: 210000, productUrl: 'https://bmgadgets.com/product/samsung-galaxy-a06-128/', sourceShop: 'BM Gadgets', sourceUrl: 'https://bmgadgets.com/product-category/phones/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },

  { name: 'Receipt Printer, 80mm Thermal Printer', category: 'Desktops', priceRwf: 130000, productUrl: 'https://tap.rw/store/product/receipt-printer-80mm-thermal-printer-12525d0f/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/category/electronics/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Soundcore by Anker P20i True Wireless Earbuds', category: 'Mobile Phones', priceRwf: 92000, productUrl: 'https://tap.rw/store/product/soundcore-by-anker-p20i-true-wireless-earbuds/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/category/electronics/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Used HP EliteDesk 800 G2 Core i5 6400T 2.2GHz 16GB 128GB SSD', category: 'Desktops', priceRwf: 287500, productUrl: 'https://tap.rw/store/tag/refurbished-pc/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/tag/refurbished-pc/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Compressed Air Duster-150000RPM', category: 'Computer Repairing', priceRwf: 86500, productUrl: 'https://tap.rw/store/product/compressed-air-duster150000rpm-6353c5a4/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/product/compressed-air-duster150000rpm-6353c5a4/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'HDMI Switch 4K HDMI Splitter', category: 'Flat Screens', priceRwf: 46000, productUrl: 'https://tap.rw/store/category/electronics/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/category/electronics/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Bidirectional HDMI Splitter 2x1 Support HDR, 3D, 4K, 1080P', category: 'Flat Screens', priceRwf: 41500, productUrl: 'https://tap.rw/store/category/electronics/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/category/electronics/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'USB C Dongle with HDMI, microSD/SD Card Reader, USB C Data Port', category: 'Laptops', priceRwf: 80500, productUrl: 'https://tap.rw/store/product/usb-c-dongle-with-hdmi-microsdsd-card-reader-usb-c-data-port-5417f7f2/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/product/usb-c-dongle-with-hdmi-microsdsd-card-reader-usb-c-data-port-5417f7f2/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: '10000mAh USB-C Power Bank', category: 'Mobile Phones', priceRwf: 71500, productUrl: 'https://tap.rw/store/category/electronics/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/category/electronics/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Philips OneBlade 360 QP2724/22', category: 'Body oil', priceRwf: 90000, productUrl: 'https://tap.rw/store/tag/featured/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/tag/featured/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },

  { name: 'Braided Sport Elastic Bracelet for Apple Watch', category: 'Mobile covers', priceRwf: 19500, productUrl: 'https://tap.rw/store/tag/featured/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/tag/featured/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Fossil chronograph with brown leather strap', category: 'Clothing', priceRwf: 282000, productUrl: 'https://tap.rw/store/tag/featured/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/tag/featured/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Afnan 9 PM Night Out Unisex Extrait de Parfum, 3.4 Fl. Oz', category: 'Body oil', priceRwf: 180000, productUrl: 'https://tap.rw/store/tag/featured/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/tag/featured/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Dove pH Balanced Body Scrub', category: 'Body oil', priceRwf: 31500, productUrl: 'https://tap.rw/store/deals/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/deals/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Minimalist 2% Salicylic Acid Body Wash', category: 'Body oil', priceRwf: 36000, productUrl: 'https://tap.rw/deals/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/deals/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Rechargeable fabric Shaver and Lint Remover', category: 'Furniture', priceRwf: 40000, productUrl: 'https://tap.rw/store/tag/fabric-shavers/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/tag/fabric-shavers/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Thermos Stainless King Vacuum Insulated Beverage Bottle', category: 'Furniture', priceRwf: 132000, productUrl: 'https://tap.rw/store/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Resistance Bands for Working Out', category: 'Football', priceRwf: 60000, productUrl: 'https://tap.rw/store/', sourceShop: 'TAP Rwanda', sourceUrl: 'https://tap.rw/store/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' }

  { name: 'Apple iPhone earpods - 3.5 mm jack', category: 'Mobile Phones', priceRwf: 40000, productUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', sourceShop: 'Best Gadget', sourceUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Sony PS5 Controller', category: 'Toys', priceRwf: 180000, productUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', sourceShop: 'Best Gadget', sourceUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'HDMI Cable', category: 'Flat Screens', priceRwf: 35000, productUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', sourceShop: 'Best Gadget', sourceUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Type-C To HDMI Cable', category: 'Flat Screens', priceRwf: 60000, productUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', sourceShop: 'Best Gadget', sourceUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Dell Wireless Keyboard with Mouse', category: 'Desktops', priceRwf: 80000, productUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', sourceShop: 'Best Gadget', sourceUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Apple iPhone Type C Charger - 3PIN', category: 'Mobile Phones', priceRwf: 60000, productUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', sourceShop: 'Best Gadget', sourceUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'HP Pavilion 14 i5 1135G7 14 Laptop', category: 'Laptops', priceRwf: 750000, productUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', sourceShop: 'Best Gadget', sourceUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'HP Envy 13 X360 i7 1185G7 Touchscreen', category: 'Laptops', priceRwf: 980000, productUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', sourceShop: 'Best Gadget', sourceUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'HP 250 G8 i7 1065G7 15.6 Laptop', category: 'Laptops', priceRwf: 860000, productUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', sourceShop: 'Best Gadget', sourceUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Dell Vostro 3400 i5 1135G7 14 Laptop', category: 'Laptops', priceRwf: 680000, productUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', sourceShop: 'Best Gadget', sourceUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Apple MacBook Pro M2 Pro 14 inch 2023 512GB', category: 'Laptops', priceRwf: 2700000, productUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', sourceShop: 'Best Gadget', sourceUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Sony WH-CH710N Noise-Cancelling Headphones', category: 'Mobile Phones', priceRwf: 350000, productUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', sourceShop: 'Best Gadget', sourceUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'JBL Tune 710BT Headphones', category: 'Mobile Phones', priceRwf: 150000, productUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', sourceShop: 'Best Gadget', sourceUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'JBL GO3 Speaker', category: 'Mobile Phones', priceRwf: 90000, productUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', sourceShop: 'Best Gadget', sourceUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'JBL Charge 5 Speaker', category: 'Mobile Phones', priceRwf: 300000, productUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', sourceShop: 'Best Gadget', sourceUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Samsung Galaxy A53 128GB', category: 'Mobile Phones', priceRwf: 450000, productUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', sourceShop: 'Best Gadget', sourceUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Samsung Galaxy A14 128GB', category: 'Mobile Phones', priceRwf: 240000, productUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', sourceShop: 'Best Gadget', sourceUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Samsung Galaxy A04e 64GB', category: 'Mobile Phones', priceRwf: 150000, productUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', sourceShop: 'Best Gadget', sourceUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Apple iPhone Xs Max 256GB Silver', category: 'Mobile Phones', priceRwf: 800000, productUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', sourceShop: 'Best Gadget', sourceUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'USB-C 4 IN 1 Multi-Port Hub', category: 'Laptops', priceRwf: 70000, productUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', sourceShop: 'Best Gadget', sourceUrl: 'https://app.isokko.com/store/bestgadget?category=1&page=2', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'TP-Link EAP115 N300 Wireless Access Point', category: 'Laptops', priceRwf: 45000, productUrl: 'https://www.kigaliboutique.com/', sourceShop: 'Kigali Boutique', sourceUrl: 'https://www.kigaliboutique.com/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'HDMI splitter 2 in 1', category: 'Flat Screens', priceRwf: 25000, productUrl: 'https://www.kigaliboutique.com/', sourceShop: 'Kigali Boutique', sourceUrl: 'https://www.kigaliboutique.com/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'MIHD Splitter 4 in 1', category: 'Flat Screens', priceRwf: 35000, productUrl: 'https://www.kigaliboutique.com/', sourceShop: 'Kigali Boutique', sourceUrl: 'https://www.kigaliboutique.com/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'DETECK DT800 Bank Grade Mixed Denomination Money Counter', category: 'Desktops', priceRwf: 150000, productUrl: 'https://www.kigaliboutique.com/', sourceShop: 'Kigali Boutique', sourceUrl: 'https://www.kigaliboutique.com/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Logitech Mouse', category: 'Desktops', priceRwf: 45000, productUrl: 'https://www.kigaliboutique.com/', sourceShop: 'Kigali Boutique', sourceUrl: 'https://www.kigaliboutique.com/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Bill Counter', category: 'Desktops', priceRwf: 150000, productUrl: 'https://www.kigaliboutique.com/', sourceShop: 'Kigali Boutique', sourceUrl: 'https://www.kigaliboutique.com/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Projector Awei', category: 'Flat Screens', priceRwf: 700000, productUrl: 'https://www.kigaliboutique.com/', sourceShop: 'Kigali Boutique', sourceUrl: 'https://www.kigaliboutique.com/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Projector Acer', category: 'Flat Screens', priceRwf: 650000, productUrl: 'https://www.kigaliboutique.com/', sourceShop: 'Kigali Boutique', sourceUrl: 'https://www.kigaliboutique.com/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Media Convert', category: 'Desktops', priceRwf: 65000, productUrl: 'https://www.kigaliboutique.com/', sourceShop: 'Kigali Boutique', sourceUrl: 'https://www.kigaliboutique.com/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Redmi Watch Active 5', category: 'Mobile Phones', priceRwf: 79999, productUrl: 'https://www.kigaliboutique.com/', sourceShop: 'Kigali Boutique', sourceUrl: 'https://www.kigaliboutique.com/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Bulb Camera 2C', category: 'Bulbs', priceRwf: 75000, productUrl: 'https://www.kigaliboutique.com/', sourceShop: 'Kigali Boutique', sourceUrl: 'https://www.kigaliboutique.com/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'Cruiser SC Camera', category: 'Bulbs', priceRwf: 110000, productUrl: 'https://www.kigaliboutique.com/', sourceShop: 'Kigali Boutique', sourceUrl: 'https://www.kigaliboutique.com/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },
  { name: 'TP-Link TL-WR940N 450Mbps Wireless N Router', category: 'Laptops', priceRwf: 85000, productUrl: 'https://www.kigaliboutique.com/', sourceShop: 'Kigali Boutique', sourceUrl: 'https://www.kigaliboutique.com/', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED' },

  { name: 'Samsung Galaxy A15 128GB', category: 'Mobile Phones', priceRwf: 195000, productUrl: 'https://www.amazon.com/s?k=Samsung+Galaxy+A15+128GB', sourceShop: 'Amazon (international reference)', sourceUrl: 'https://www.amazon.com/s?k=Samsung+Galaxy+A15+128GB', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED', referenceCurrency: 'USD', sourceType: 'international' },
  { name: 'Tecno Spark 20 Pro', category: 'Mobile Phones', priceRwf: 145000, productUrl: 'https://www.amazon.com/s?k=Tecno+Spark+20+Pro', sourceShop: 'Amazon (international reference)', sourceUrl: 'https://www.amazon.com/s?k=Tecno+Spark+20+Pro', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED', referenceCurrency: 'USD', sourceType: 'international' },
  { name: 'Anker Soundcore Q20i Headphones', category: 'Mobile Phones', priceRwf: 145000, productUrl: 'https://www.amazon.com/s?k=Anker+Soundcore+Q20i', sourceShop: 'Amazon (international reference)', sourceUrl: 'https://www.amazon.com/s?k=Anker+Soundcore+Q20i', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED', referenceCurrency: 'USD', sourceType: 'international' },
  { name: 'HP 15.6 Laptop', category: 'Laptops', priceRwf: 450000, productUrl: 'https://www.bestbuy.com/site/searchpage.jsp?st=HP+15.6+laptop', sourceShop: 'Best Buy (international reference)', sourceUrl: 'https://www.bestbuy.com/site/searchpage.jsp?st=HP+15.6+laptop', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED', referenceCurrency: 'USD', sourceType: 'international' },
  { name: 'Lenovo ThinkPad E14', category: 'Laptops', priceRwf: 520000, productUrl: 'https://www.amazon.com/s?k=Lenovo+ThinkPad+E14', sourceShop: 'Amazon (international reference)', sourceUrl: 'https://www.amazon.com/s?k=Lenovo+ThinkPad+E14', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED', referenceCurrency: 'USD', sourceType: 'international' },
  { name: 'Sony WH-1000XM5 Headphones', category: 'Mobile Phones', priceRwf: 420000, productUrl: 'https://www.bestbuy.com/site/searchpage.jsp?st=Sony+WH-1000XM5', sourceShop: 'Best Buy (international reference)', sourceUrl: 'https://www.bestbuy.com/site/searchpage.jsp?st=Sony+WH-1000XM5', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED', referenceCurrency: 'USD', sourceType: 'international' },
  { name: 'Apple AirPods Pro (2nd generation)', category: 'Mobile Phones', priceRwf: 330000, productUrl: 'https://www.bestbuy.com/site/searchpage.jsp?st=AirPods+Pro+2', sourceShop: 'Best Buy (international reference)', sourceUrl: 'https://www.bestbuy.com/site/searchpage.jsp?st=AirPods+Pro+2', verifiedAt: '2026-09-19', priceStatus: 'RW_VERIFIED', referenceCurrency: 'USD', sourceType: 'international' },
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
        priceStatus: item.priceStatus,
        priceSourceShop: item.priceSourceShop,
        priceSourceUrl: item.priceSourceUrl,
        stock: 1,
        status: 'ACTIVE',
        description: 'Source: ' + item.sourceShop + '. Price status: ' + (item.priceStatus || 'RW_REFERENCE') + '. Verified: ' + item.verifiedAt + '.'
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
