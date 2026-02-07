import { NextResponse } from "next/server";
import { db, COLLECTIONS } from "@/lib/firestore";

// Default packages for when database is unavailable
const DEFAULT_PACKAGES = [
  {
    id: "mtn-1gb",
    name: "MTN 1GB",
    network: "MTN",
    capacity: "1",
    basePrice: 4.0,
    description: "1GB valid for 30 days",
    image: "/images/New-mtn-logo.png",
  },
  {
    id: "mtn-2gb",
    name: "MTN 2GB",
    network: "MTN",
    capacity: "2",
    basePrice: 7.5,
    description: "2GB valid for 30 days",
    image: "/images/New-mtn-logo.png",
  },
  {
    id: "mtn-5gb",
    name: "MTN 5GB",
    network: "MTN",
    capacity: "5",
    basePrice: 15.0,
    description: "5GB valid for 30 days",
    image: "/images/New-mtn-logo.png",
  },
  {
    id: "mtn-10gb",
    name: "MTN 10GB",
    network: "MTN",
    capacity: "10",
    basePrice: 25.0,
    description: "10GB valid for 30 days",
    image: "/images/New-mtn-logo.png",
  },
];

export async function GET() {
  try {
    // Fetch packages from Firestore
    const packagesSnapshot = await db
      .collection(COLLECTIONS.PACKAGES)
      .where("isActive", "==", true)
      .orderBy("network")
      .orderBy("basePrice")
      .get();

    if (!packagesSnapshot.empty) {
      const packages = packagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      return NextResponse.json({
        success: true,
        data: packages,
        total: packages.length,
        source: "firestore",
      });
    }

    // Otherwise return default packages
    return NextResponse.json({
      success: true,
      data: DEFAULT_PACKAGES,
      total: DEFAULT_PACKAGES.length,
      source: "default",
    });
  } catch (error) {
    console.error("[PACKAGES ERROR]", error);
    
    // If Firestore is unavailable, return default packages
    return NextResponse.json({
      success: true,
      data: DEFAULT_PACKAGES,
      total: DEFAULT_PACKAGES.length,
      source: "default (firestore unavailable)",
    });
  }
}
