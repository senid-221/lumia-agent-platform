import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const services = [
  ['hair-fashion','Hair Fashion','Salon, hair styling, braiding, haircut and related services.'],
  ['driving-training','Driving Training','Driving theory and practical training.'],
  ['restaurant-bookers','Restaurant Bookers','Restaurant discovery, menu help and reservation requests.'],
  ['shopping-orders','Shopping Orders','Product discovery and customer purchase requests.'],
  ['car-repairing','Car Repairing','Car diagnostics and repair provider requests.'],
  ['motor-repairing','Motor Repairing','Motorcycle diagnostics and repair provider requests.'],
  ['land-survey','Land Survey','Land measurement and surveying provider requests.'],
  ['computer-repairing','Computer Repairing','Computer troubleshooting and repair provider requests.'],
  ['boutique-food-ordering','Boutique Food Ordering','Food and grocery ordering from listed providers.'],
  ['website-building','Website Building','Website design and development requests.'],
  ['web-hosting','Web Hosting','Website hosting and domain support requests.'],
  ['teaching-tech','Teaching Tech','Technology learning and teacher matching.'],
  ['prompt-generation','Prompt Generation','Professional AI prompt creation.'],
  ['flyer-graphic-design','Flyer & Graphic Design','Flyer and graphic design requests.'],
  ['jobs-for-seekers','Jobs for Seekers','Job opportunity discovery and application support.']
] as const;

async function main() {
  for (const [slug, name, description] of services) {
    await db.platformService.upsert({
      where: { slug },
      update: { name, description, active: true },
      create: { slug, name, description, active: true }
    });
  }
}

main().finally(() => db.$disconnect());
