import { NextRequest, NextResponse } from "next/server";
import { db, COLLECTIONS } from "@/lib/firestore";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Invalid slug" },
        { status: 400 }
      );
    }

    console.log(`[SHOP API] Fetching store data for slug: ${slug}`);

    // Find agent by slug
    const agentsSnapshot = await db
      .collection(COLLECTIONS.AGENTS)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (agentsSnapshot.empty) {
      console.log(`[SHOP API] Agent not found for slug: ${slug}`);
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    const agentDoc = agentsSnapshot.docs[0];
    const agentData = agentDoc.data();

    // Check if agent is activated
    if (agentData.status !== "ACTIVATED") {
      console.log(`[SHOP API] Agent not activated: ${slug}`);
      return NextResponse.json(
        { error: "Store not available" },
        { status: 403 }
      );
    }

    // Fetch packages
    const packagesSnapshot = await db
      .collection(COLLECTIONS.PACKAGES)
      .where("isActive", "==", true)
      .get();

    let packages: any[] = packagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // If no packages in database, use defaults
    if (packages.length === 0) {
      packages = [
        {
          id: "pkg-1gb",
          name: "1GB Data",
          network: "MTN",
          capacity: "1",
          basePrice: 4.5,
          description: "Data bundle",
          image: "/images/New-mtn-logo.jpg",
          isActive: true,
        },
        {
          id: "pkg-2gb",
          name: "2GB Data",
          network: "MTN",
          capacity: "2",
          basePrice: 7.5,
          description: "Data bundle",
          image: "/images/New-mtn-logo.jpg",
          isActive: true,
        },
        {
          id: "pkg-5gb",
          name: "5GB Data",
          network: "MTN",
          capacity: "5",
          basePrice: 15,
          description: "Data bundle",
          image: "/images/New-mtn-logo.jpg",
          isActive: true,
        },
        {
          id: "pkg-10gb",
          name: "10GB Data",
          network: "MTN",
          capacity: "10",
          basePrice: 25,
          description: "Data bundle",
          image: "/images/New-mtn-logo.jpg",
          isActive: true,
        },
      ];
    }

    // Apply agent custom prices
    const agentPrices = agentData.agentPrices || {};
    const productsWithAgentPrices = packages.map((pkg: any) => {
      const agentPrice = agentPrices[pkg.id] || pkg.basePrice;
      return {
        ...pkg,
        price: agentPrice, // Use agent price for display
        basePrice: pkg.basePrice,
        agentPrice: agentPrice,
        commission: agentPrice - pkg.basePrice, // Commission per sale
      };
    });

    console.log(
      `[SHOP API] Returning store data with ${productsWithAgentPrices.length} products for agent: ${slug}`
    );

    return NextResponse.json({
      success: true,
      store_slug: slug,
      agent_id: agentDoc.id,
      agent_name: agentData.name,
      agent_email: agentData.email,
      agent_phone: agentData.phone || "",
      agent_description: agentData.description || "",
      agent_logo: agentData.logo || null,
      agent_cover: agentData.coverImage || null,
      store_name: agentData.businessName || agentData.name,
      status: agentData.status,
      total_earned: agentData.totalEarned || 0,
      total_orders: agentData.totalOrders || 0,
      products: productsWithAgentPrices,
    });
  } catch (error) {
    console.error("[SHOP API ERROR]", error);
    return NextResponse.json(
      { error: "Failed to load store" },
      { status: 500 }
    );
  }
}
