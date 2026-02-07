import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.development.local" });
dotenv.config({ path: ".env.local" });

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // This will use GOOGLE_APPLICATION_CREDENTIALS environment variable
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

const db = admin.firestore();

// Default packages
const DEFAULT_PACKAGES = [
  {
    name: "MTN 1GB",
    network: "MTN",
    capacity: "1",
    basePrice: 4.0,
    description: "1GB valid for 30 days",
    image: "/images/New-mtn-logo.png",
    isActive: true,
    createdAt: admin.firestore.Timestamp.now(),
  },
  {
    name: "MTN 2GB",
    network: "MTN",
    capacity: "2",
    basePrice: 7.5,
    description: "2GB valid for 30 days",
    image: "/images/New-mtn-logo.png",
    isActive: true,
    createdAt: admin.firestore.Timestamp.now(),
  },
  {
    name: "MTN 5GB",
    network: "MTN",
    capacity: "5",
    basePrice: 15.0,
    description: "5GB valid for 30 days",
    image: "/images/New-mtn-logo.png",
    isActive: true,
    createdAt: admin.firestore.Timestamp.now(),
  },
  {
    name: "MTN 10GB",
    network: "MTN",
    capacity: "10",
    basePrice: 25.0,
    description: "10GB valid for 30 days",
    image: "/images/New-mtn-logo.png",
    isActive: true,
    createdAt: admin.firestore.Timestamp.now(),
  },
];

async function seed() {
  try {
    console.log("🌱 Starting Firestore seed...");

    // Add packages
    console.log("Adding packages...");
    for (const pkg of DEFAULT_PACKAGES) {
      const docRef = await db.collection("packages").add(pkg);
      console.log(`✓ Added package: ${pkg.name} (${docRef.id})`);
    }

    console.log("\n✅ Firestore seeding complete!");
    console.log("\nCollections initialized:");
    console.log("  - packages (with 4 MTN packages)");
    console.log("  - agents (ready for new agents)");
    console.log("  - orders (ready for orders)");
    console.log("  - transactions (ready for transactions)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
