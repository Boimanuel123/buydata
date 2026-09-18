import { NextResponse } from "next/server";
import { db, COLLECTIONS } from "@/lib/firestore";

// Default packages for when database is unavailable
export const DEFAULT_PACKAGES = [
  {
    id: "mtn-1gb",
    name: "MTN 1GB",
    network: "MTN",
    capacity: "1",
    basePrice: 4.0,
    description: "1GB valid for 30 days",
    image: "/images/MTN.jpg",
  },
  {
    id: "mtn-2gb",
    name: "MTN 2GB",
    network: "MTN",
    capacity: "2",
    basePrice: 7.5,
    description: "2GB valid for 30 days",
    image: "/images/MTN.jpg",
  },
  {
    id: "mtn-5gb",
    name: "MTN 5GB",
    network: "MTN",
    capacity: "5",
    basePrice: 15.0,
    description: "5GB valid for 30 days",
    image: "/images/MTN.jpg",
  },
  {
    id: "mtn-10gb",
    name: "MTN 10GB",
    network: "MTN",
    capacity: "10",
    basePrice: 25.0,
    description: "10GB valid for 30 days",
    image: "/images/MTN.jpg",
  },
  {
    id: "telecel-1gb",
    name: "TELECEL 1GB",
    network: "TELECEL",
    capacity: "1",
    basePrice: 4.0,
    description: "1GB valid for 30 days",
    image: "/images/TELECEL.jpg",
  },
  {
    id: "telecel-5gb",
    name: "TELECEL 5GB",
    network: "TELECEL",
    capacity: "5",
    basePrice: 15.0,
    description: "5GB valid for 30 days",
    image: "/images/TELECEL.jpg",
  },
  {
    id: "at-1gb",
    name: "AirtelTigo 1GB",
    network: "AT",
    capacity: "1",
    basePrice: 4.0,
    description: "1GB valid for 30 days",
    image: "/images/AT.png",
  },
  {
    id: "at-5gb",
    name: "AirtelTigo 5GB",
    network: "AT",
    capacity: "5",
    basePrice: 15.0,
    description: "5GB valid for 30 days",
    image: "/images/AT.png",
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
        packages: packages,
        total: packages.length,
        source: "firestore",
      });
    }

    // Otherwise return default packages
    return NextResponse.json({
      success: true,
      packages: DEFAULT_PACKAGES,
      total: DEFAULT_PACKAGES.length,
      source: "default",
    });
  } catch (error) {
    console.error("[PACKAGES ERROR]", error);
    
    // If Firestore is unavailable, return default packages
    return NextResponse.json({
      success: true,
      packages: DEFAULT_PACKAGES,
      total: DEFAULT_PACKAGES.length,
      source: "default (firestore unavailable)",
    });
  }
}
