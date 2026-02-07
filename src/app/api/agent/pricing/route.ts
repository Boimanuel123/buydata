import { NextRequest, NextResponse } from "next/server";
import { db, COLLECTIONS } from "@/lib/firestore";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");
    const firebaseUid = authHeader?.replace("Bearer ", "").trim();

    if (!firebaseUid) {
      console.log("[PRICING] Missing authorization");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { agentPrices } = body;

    if (!agentPrices || typeof agentPrices !== "object") {
      return NextResponse.json(
        { error: "Invalid agentPrices format" },
        { status: 400 }
      );
    }

    console.log("[PRICING] Updating prices for UID:", firebaseUid);
    console.log("[PRICING] Agent prices:", agentPrices);

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

    // Update pricing data
    const updateData: any = {
      agentPrices: agentPrices,
      updatedAt: new Date(),
    };

    // Update agent in Firestore
    await db
      .collection(COLLECTIONS.AGENTS)
      .doc(agentDoc.id)
      .update(updateData);

    console.log("[PRICING] Prices saved successfully for agent:", agentDoc.id);

    return NextResponse.json({
      success: true,
      message: "Prices updated successfully",
      agent: {
        id: agentDoc.id,
        agentPrices: agentPrices,
      },
    });
  } catch (error) {
    console.error("[PRICING ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update prices" },
      { status: 500 }
    );
  }
}
