import { PrismaClient, UserRole, DeliveryZone } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@farmbox.tn' },
    update: {},
    create: {
      email: 'admin@farmbox.tn',
      phone: '+21612345678',
      passwordHash: adminPassword,
      name: 'Admin FarmBox',
      role: UserRole.ADMIN,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create sample farmer
  const farmerPassword = await bcrypt.hash('farmer123', 10);
  const farmer = await prisma.user.upsert({
    where: { email: 'ahmed@fermebensalem.tn' },
    update: {},
    create: {
      email: 'ahmed@fermebensalem.tn',
      phone: '+21698765432',
      passwordHash: farmerPassword,
      name: 'Ahmed Ben Salem',
      role: UserRole.FARMER,
      address: 'Route de Zaghouan, Km 15',
      city: 'Zaghouan',
      zone: DeliveryZone.ZONE_B,
    },
  });
  console.log('✅ Farmer user created:', farmer.email);

  // Create sample farm
  const farm = await prisma.farm.upsert({
    where: { slug: 'ferme-ben-salem' },
    update: {},
    create: {
      name: 'Ferme Ben Salem',
      slug: 'ferme-ben-salem',
      description: 'Ferme familiale bio depuis 3 générations, spécialisée dans les légumes de saison et les herbes aromatiques. Nous cultivons avec passion des produits frais et sains pour votre table.',
      story: 'Notre famille cultive cette terre fertile depuis 1960. Mon grand-père a commencé avec quelques hectares de blé et d\'oliviers. Aujourd\'hui, nous pratiquons une agriculture traditionnelle et respectueuse de l\'environnement, en combinant les savoirs ancestraux avec les techniques modernes de l\'agriculture biologique.',
      address: 'Route de Zaghouan, Km 15',
      city: 'Zaghouan',
      coordinates: { lat: 36.4028, lng: 10.1428 },
      phone: '+21698765432',
      whatsapp: '+21698765432',
      email: 'contact@fermebensalem.tn',
      deliveryZones: [DeliveryZone.ZONE_A, DeliveryZone.ZONE_B],
      isActive: true,
      isVerified: true,
      ownerId: farmer.id,
    },
  });
  console.log('✅ Farm created:', farm.name);

  // Create sample products
  const products = [
    {
      name: 'Tomates Bio',
      nameAr: 'طماطم عضوية',
      description: 'Tomates fraîches cultivées sans pesticides, parfaites pour les salades et les sauces.',
      price: 3.5,
      unit: 'kg',
      category: 'vegetables',
      isAvailable: true,
      seasonStart: 5,
      seasonEnd: 10,
      farmId: farm.id,
    },
    {
      name: 'Menthe Fraîche',
      nameAr: 'نعناع طازج',
      description: 'Bouquet de menthe fraîche, idéal pour le thé tunisien et la cuisine.',
      price: 1.5,
      unit: 'bouquet',
      category: 'herbs',
      isAvailable: true,
      farmId: farm.id,
    },
    {
      name: 'Persil Plat',
      nameAr: 'بقدونس',
      description: 'Persil frais et parfumé pour accompagner tous vos plats.',
      price: 1.0,
      unit: 'bouquet',
      category: 'herbs',
      isAvailable: true,
      farmId: farm.id,
    },
    {
      name: 'Courgettes',
      nameAr: 'كوسة',
      description: 'Courgettes tendres et savoureuses, récoltées à maturité.',
      price: 2.8,
      unit: 'kg',
      category: 'vegetables',
      isAvailable: true,
      seasonStart: 4,
      seasonEnd: 10,
      farmId: farm.id,
    },
    {
      name: 'Poivrons Mélangés',
      nameAr: 'فلفل ملون',
      description: 'Assortiment de poivrons rouges, verts et jaunes.',
      price: 4.5,
      unit: 'kg',
      category: 'vegetables',
      isAvailable: true,
      seasonStart: 5,
      seasonEnd: 10,
      farmId: farm.id,
    },
    {
      name: 'Huile d\'Olive Extra Vierge',
      nameAr: 'زيت زيتون بكر ممتاز',
      description: 'Huile d\'olive première pression à froid, de nos oliviers centenaires.',
      price: 20.0,
      unit: 'litre',
      category: 'olive-oil',
      isAvailable: true,
      farmId: farm.id,
    },
    {
      name: 'Oeufs Fermiers',
      nameAr: 'بيض بلدي',
      description: 'Oeufs de poules élevées en plein air, nourries aux grains bio.',
      price: 6.0,
      unit: 'douzaine',
      category: 'eggs',
      isAvailable: true,
      farmId: farm.id,
    },
    {
      name: 'Miel de Thym',
      nameAr: 'عسل الزعتر',
      description: 'Miel pur récolté dans les collines de thym sauvage.',
      price: 35.0,
      unit: 'kg',
      category: 'honey',
      isAvailable: true,
      farmId: farm.id,
    },
    {
      name: 'Olives Vertes',
      nameAr: 'زيتون أخضر',
      description: 'Olives vertes marinées aux herbes de Provence.',
      price: 8.0,
      unit: 'kg',
      category: 'olive-oil',
      isAvailable: true,
      seasonStart: 10,
      seasonEnd: 12,
      farmId: farm.id,
    },
    {
      name: 'Artichauts',
      nameAr: 'قرنون',
      description: 'Artichauts frais, un délice de la cuisine tunisienne.',
      price: 5.0,
      unit: 'kg',
      category: 'vegetables',
      isAvailable: true,
      seasonStart: 2,
      seasonEnd: 5,
      farmId: farm.id,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }
  console.log(`✅ ${products.length} products created`);

  // Create delivery schedules
  const schedules = [
    { zone: DeliveryZone.ZONE_A, dayOfWeek: 3, timeWindows: ['6:00-9:00', '18:00-21:00'] }, // Wednesday
    { zone: DeliveryZone.ZONE_B, dayOfWeek: 4, timeWindows: ['6:00-9:00', '18:00-21:00'] }, // Thursday
    { zone: DeliveryZone.ZONE_C, dayOfWeek: 4, timeWindows: ['7:00-10:00', '17:00-20:00'] }, // Thursday
  ];

  for (const schedule of schedules) {
    await prisma.deliverySchedule.upsert({
      where: { zone_dayOfWeek: { zone: schedule.zone, dayOfWeek: schedule.dayOfWeek } },
      update: {},
      create: schedule,
    });
  }
  console.log('✅ Delivery schedules created');

  // Create sample customer
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'sonia@example.tn' },
    update: {},
    create: {
      email: 'sonia@example.tn',
      phone: '+21655555555',
      passwordHash: customerPassword,
      name: 'Sonia Trabelsi',
      role: UserRole.CUSTOMER,
      address: '15 Avenue Habib Bourguiba',
      city: 'La Marsa',
      zone: DeliveryZone.ZONE_A,
    },
  });
  console.log('✅ Customer user created:', customer.email);

  // Create a sample review
  await prisma.review.upsert({
    where: { customerId_farmId: { customerId: customer.id, farmId: farm.id } },
    update: {},
    create: {
      customerId: customer.id,
      farmId: farm.id,
      rating: 5,
      comment: 'Excellents produits, très frais et le service de livraison est impeccable. Je recommande vivement!',
    },
  });
  console.log('✅ Sample review created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Test credentials:');
  console.log('   Admin: admin@farmbox.tn / admin123');
  console.log('   Farmer: ahmed@fermebensalem.tn / farmer123');
  console.log('   Customer: sonia@example.tn / customer123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
