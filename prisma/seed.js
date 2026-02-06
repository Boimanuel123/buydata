// prisma/seed.js
// Run with: npm run prisma:seed

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Delete existing data
  await prisma.transaction.deleteMany();
  await prisma.order.deleteMany();
  await prisma.agentProduct.deleteMany();
  await prisma.agent.deleteMany();

  console.log("🗑️  Cleaned existing data");

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

  // Create test products for the agent
  const products = [
    {
      agentId: testAgent.id,
      productId: "telecel-1gb",
      name: "Vodafone 1GB",
      network: "TELECEL",
      capacity: "1",
      price: 3.5,
      description: "1GB valid for 30 days",
    },
    {
      agentId: testAgent.id,
      productId: "telecel-5gb",
      name: "Vodafone 5GB",
      network: "TELECEL",
      capacity: "5",
      price: 15.0,
      description: "5GB valid for 30 days",
    },
    {
      agentId: testAgent.id,
      productId: "mtn-1gb",
      name: "MTN 1GB",
      network: "YELLO",
      capacity: "1",
      price: 3.5,
      description: "1GB valid for 30 days",
    },
    {
      agentId: testAgent.id,
      productId: "mtn-5gb",
      name: "MTN 5GB",
      network: "YELLO",
      capacity: "5",
      price: 15.0,
      description: "5GB valid for 30 days",
    },
  ];

  for (const product of products) {
    await prisma.agentProduct.create({ data: product });
  }

  console.log("✅ Created test products");

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
