// prisma/seed.js
// Run with: npm run prisma:seed

require("dotenv").config({ path: ".env.local" });

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Delete existing data
  await prisma.transaction.deleteMany();
  await prisma.order.deleteMany();
  await prisma.agentProduct.deleteMany();
  await prisma.package.deleteMany();
  await prisma.agent.deleteMany();

  console.log("🗑️  Cleaned existing data");

  // Seed data packages (MTN only)
  const packages = [
    {
      name: "MTN 1GB",
      network: "MTN",
      capacity: "1",
      basePrice: 4.0,
      description: "1GB valid for 30 days",
      image: "/images/New-mtn-logo.png",
    },
    {
      name: "MTN 2GB",
      network: "MTN",
      capacity: "2",
      basePrice: 7.5,
      description: "2GB valid for 30 days",
      image: "/images/New-mtn-logo.png",
    },
    {
      name: "MTN 5GB",
      network: "MTN",
      capacity: "5",
      basePrice: 15.0,
      description: "5GB valid for 30 days",
      image: "/images/New-mtn-logo.png",
    },
    {
      name: "MTN 10GB",
      network: "MTN",
      capacity: "10",
      basePrice: 25.0,
      description: "10GB valid for 30 days",
      image: "/images/New-mtn-logo.png",
    },
  ];

  console.log("📦 Creating data packages...");
  for (const pkg of packages) {
    await prisma.package.create({
      data: {
        ...pkg,
        isActive: true,
      },
    });
  }
  console.log(`✅ Created ${packages.length} data packages`);

  // Create test agent
  const testAgent = await prisma.agent.create({
    data: {
      email: "test@example.com",
      password: await bcrypt.hash("Test1234", 12),
      name: "Test Agent",
      phone: "+233501234567",
      businessName: "Test Data Shop",
      description: "A test data reseller for development",
      slug: "test-data-shop-001",
      status: "ACTIVATED",
      activatedAt: new Date(),
      commissionRate: 0.1,
      totalEarned: 0,
      totalWithdrawn: 0,
      balance: 0,
    },
  });

  console.log("✅ Created test agent:", testAgent.email);

  // Create test products for the agent (MTN only)
  const products = [
    {
      agentId: testAgent.id,
      productId: "mtn-1gb",
      name: "MTN 1GB",
      network: "MTN",
      capacity: "1",
      price: 4.0,
      description: "1GB valid for 30 days",
    },
    {
      agentId: testAgent.id,
      productId: "mtn-5gb",
      name: "MTN 5GB",
      network: "MTN",
      capacity: "5",
      price: 15.0,
      description: "5GB valid for 30 days",
    },
  ];

  for (const product of products) {
    await prisma.agentProduct.create({ data: product });
  }

  console.log("✅ Created test products (MTN only)");

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📝 Test Credentials:");
  console.log("   Email: test@example.com");
  console.log("   Password: Test1234");
  console.log("\n🔗 Agent Link: http://localhost:3000/test-data-shop-001");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
