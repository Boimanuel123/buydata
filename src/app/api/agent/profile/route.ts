import { NextRequest, NextResponse } from "next/server";
import { db, COLLECTIONS } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  try {
    // Get Firebase UID from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      console.log("[PROFILE] Missing authorization header");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const firebaseUid = authHeader.replace("Bearer ", "").trim();
    if (!firebaseUid) {
      console.log("[PROFILE] Empty Firebase UID");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[PROFILE] Fetching agent for UID:", firebaseUid);

    // Query Firestore for agent by firebaseUid
    const agentsSnapshot = await db
      .collection(COLLECTIONS.AGENTS)
      .where("firebaseUid", "==", firebaseUid)
      .limit(1)
      .get();

    if (!agentsSnapshot.empty) {
      const doc = agentsSnapshot.docs[0];
      const data = doc.data();
      console.log("[PROFILE] Agent found in Firestore:", doc.id, "Status:", data.status);
      
      return NextResponse.json({
        success: true,
        agent: {
          id: doc.id,
          name: data.name || "Agent",
          email: data.email || "",
          phone: data.phone || "",
          businessName: data.businessName || "My Business",
          description: data.description || "",
          logo: data.logo || null,
          coverImage: data.coverImage || null,
          status: data.status || "PENDING",
          slug: data.slug,
          totalEarned: data.totalEarned || 0,
          totalWithdrawn: data.totalWithdrawn || 0,
          totalOrders: data.totalOrders || 0,
          balance: data.balance || 0,
          commissionRate: data.commissionRate || 0.1,
          createdAt: data.createdAt?.toDate() || new Date(),
          activatedAt: data.activatedAt?.toDate() || null,
        },
      });
    }

    console.log("[PROFILE] Agent not found in Firestore");
    return NextResponse.json(
      { error: "Agent profile not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("[PROFILE] Error:", error);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");
    const firebaseUid = authHeader?.replace("Bearer ", "").trim();

    if (!firebaseUid) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const agent = await prisma.agent.update({
      where: { firebaseUid },
      data: body,
    });

    return NextResponse.json({
      success: true,
      agent,
    });
  } catch (error) {
    console.error("[PROFILE PUT] Error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
