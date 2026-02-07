import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedPackages() {
  // Clear existing packages
  await prisma.package.deleteMany({});

  const packages = [
    // MTN Packages
    {
      name: "MTN 1GB",
      network: "MTN",
      capacity: "1",
      basePrice: 4.0,
      description: "1GB valid for 30 days",
      image: "https://via.placeholder.com/200x200?text=MTN+1GB",
    },
    {
      name: "MTN 2GB",
      network: "MTN",
      capacity: "2",
      basePrice: 7.5,
      description: "2GB valid for 30 days",
      image: "https://via.placeholder.com/200x200?text=MTN+2GB",
    },
    {
      name: "MTN 5GB",
      network: "MTN",
      capacity: "5",
      basePrice: 15.0,
      description: "5GB valid for 30 days",
      image: "https://via.placeholder.com/200x200?text=MTN+5GB",
    },
    {
      name: "MTN 10GB",
      network: "MTN",
      capacity: "10",
      basePrice: 25.0,
      description: "10GB valid for 30 days",
      image: "https://via.placeholder.com/200x200?text=MTN+10GB",
    },

    // Vodafone Packages
    {
      name: "Vodafone 1GB",
      network: "VODAFONE",
      capacity: "1",
      basePrice: 3.5,
      description: "1GB valid for 30 days",
      image: "https://via.placeholder.com/200x200?text=Vodafone+1GB",
    },
    {
      name: "Vodafone 2GB",
      network: "VODAFONE",
      capacity: "2",
      basePrice: 6.5,
      description: "2GB valid for 30 days",
      image: "https://via.placeholder.com/200x200?text=Vodafone+2GB",
    },
    {
      name: "Vodafone 5GB",
      network: "VODAFONE",
      capacity: "5",
      basePrice: 13.0,
      description: "5GB valid for 30 days",
      image: "https://via.placeholder.com/200x200?text=Vodafone+5GB",
    },
    {
      name: "Vodafone 10GB",
      network: "VODAFONE",
      capacity: "10",
      basePrice: 22.0,
      description: "10GB valid for 30 days",
      image: "https://via.placeholder.com/200x200?text=Vodafone+10GB",
    },

    // AT Premium Packages
    {
      name: "AT Premium 1GB",
      network: "AT_PREMIUM",
      capacity: "1",
      basePrice: 5.0,
      description: "1GB valid for 30 days",
      image: "https://via.placeholder.com/200x200?text=AT+Premium+1GB",
    },
    {
      name: "AT Premium 5GB",
      network: "AT_PREMIUM",
      capacity: "5",
      basePrice: 18.0,
      description: "5GB valid for 30 days",
      image: "https://via.placeholder.com/200x200?text=AT+Premium+5GB",
    },

    // Telecel Packages
    {
      name: "Telecel 1GB",
      network: "TELECEL",
      capacity: "1",
      basePrice: 3.0,
      description: "1GB valid for 30 days",
      image: "https://via.placeholder.com/200x200?text=Telecel+1GB",
    },
    {
      name: "Telecel 5GB",
      network: "TELECEL",
      capacity: "5",
      basePrice: 12.0,
      description: "5GB valid for 30 days",
      image: "https://via.placeholder.com/200x200?text=Telecel+5GB",
    },
  ];

  console.log("Seeding packages...");
  for (const pkg of packages) {
    await prisma.package.create({
      data: {
        ...pkg,
        isActive: true,
      },
    });
  }

  console.log(`✅ Seeded ${packages.length} packages`);
}

seedPackages()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
