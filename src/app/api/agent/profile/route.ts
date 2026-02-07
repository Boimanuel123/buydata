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

    let agent = null;
    
    if (!agentsSnapshot.empty) {
      const doc = agentsSnapshot.docs[0];
      const data = doc.data();
      agent = {
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
      };
      console.log("[PROFILE] Agent found in Firestore:", agent.id, "Status:", agent.status);
    } else {
      console.log("[PROFILE] Agent not found in Firestore");
    }

    // If agent not found, return default data for new Firebase users
    if (!agent) {
      console.log("[PROFILE] Returning default data for new user");
      return NextResponse.json({
        success: true,
        agent: {
          id: firebaseUid,
          name: "Agent",
          email: "",
          phone: "",
          businessName: "My Business",
          description: "",
          logo: null,
          coverImage: null,
          status: "PENDING",
          slug: `agent-${firebaseUid.substring(0, 8)}`,
          totalEarned: 0,
          totalWithdrawn: 0,
          totalOrders: 0,
          balance: 0,
          commissionRate: 0.1,
          createdAt: new Date(),
          activatedAt: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      agent,
    });
  } catch (error) {
    console.error("[PROFILE ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
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

    const { businessName, description, phone } = body;

    // Find agent document by firebaseUid
    const agentsSnapshot = await db
      .collection(COLLECTIONS.AGENTS)
      .where("firebaseUid", "==", firebaseUid)
      .limit(1)
      .get();

    if (agentsSnapshot.empty) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    const agentDoc = agentsSnapshot.docs[0];
    const agentData = agentDoc.data();
    const updateData: any = {};
    
    if (businessName !== undefined) {
      updateData.businessName = businessName;
      
      // Regenerate slug based on new business name
      if (businessName && businessName !== agentData.businessName) {
        const slugBase = businessName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const newSlug = `${slugBase}-${randomSuffix}`;
        updateData.slug = newSlug;
        console.log("[PROFILE] Regenerated slug:", newSlug, "from business name:", businessName);
      }
    }
    
    if (description !== undefined) updateData.description = description;
    if (phone !== undefined) updateData.phone = phone;
    updateData.updatedAt = new Date();

    // Update agent in Firestore
    await db
      .collection(COLLECTIONS.AGENTS)
      .doc(agentDoc.id)
      .update(updateData);

    // Return updated agent data
    const updatedSnapshot = await db
      .collection(COLLECTIONS.AGENTS)
      .doc(agentDoc.id)
      .get();

    const updatedData = updatedSnapshot.data();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      agent: {
        id: agentDoc.id,
        name: updatedData?.name || "Agent",
        email: updatedData?.email || "",
        businessName: updatedData?.businessName || "",
        description: updatedData?.description || "",
        slug: updatedData?.slug || "",
        status: updatedData?.status || "PENDING",
      },
    });
  } catch (error) {
    console.error("[UPDATE PROFILE ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
