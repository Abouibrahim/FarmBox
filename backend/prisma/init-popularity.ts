import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initializePopularity() {
  console.log('🚀 Initializing ProductPopularity...');

  // Get all products
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products`);

  for (const product of products) {
    // Check if popularity record already exists
    const existing = await prisma.productPopularity.findUnique({
      where: { productId: product.id },
    });

    if (!existing) {
      // Create popularity record with random initial scores for demo
      const viewCount = Math.floor(Math.random() * 100) + 10;
      const orderCount = Math.floor(Math.random() * 20) + 2;
      const cartAddCount = Math.floor(Math.random() * 30) + 5;
      const score = orderCount * 0.5 + cartAddCount * 0.3 + viewCount * 0.2;

      await prisma.productPopularity.create({
        data: {
          productId: product.id,
          viewCount,
          orderCount,
          cartAddCount,
          score,
        },
      });
      console.log(`✅ Created popularity for: ${product.name}`);
    } else {
      console.log(`⏭️ Skipped (already exists): ${product.name}`);
    }
  }

  // Create some featured products
  console.log('\n📌 Creating featured products...');

  const topProducts = await prisma.productPopularity.findMany({
    orderBy: { score: 'desc' },
    take: 4,
    include: { product: true },
  });

  for (let i = 0; i < topProducts.length; i++) {
    const existing = await prisma.featuredProduct.findFirst({
      where: { productId: topProducts[i].productId },
    });

    if (!existing) {
      await prisma.featuredProduct.create({
        data: {
          productId: topProducts[i].productId,
          position: i + 1,
          isActive: true,
          featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      });
      console.log(`✅ Featured: ${topProducts[i].product.name}`);
    }
  }

  console.log('\n🎉 ProductPopularity initialization complete!');
}

initializePopularity()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
